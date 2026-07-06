import * as THREE from './vendor/three.module.js';
import { KOLKATA, raDecToAltAz, altAzToVector, formatLocalTime } from './astronomy.js';
import { prominentStars, planets,constellations, generateProceduralStars } from './skydata.js';
import { setupUI, updateUI } from './ui.js';
import { OBJLoader } from './vendor/OBJLoader.js';
import { MTLLoader } from './vendor/MTLLoader.js';


const mainCanvas = document.getElementById('mainCanvas');
const skyCanvas = document.getElementById('skyCanvas');

const renderer = new THREE.WebGLRenderer({ canvas: mainCanvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(mainCanvas.clientWidth, mainCanvas.clientHeight);
renderer.setClearColor(0x070a12, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const skyRenderer = new THREE.WebGLRenderer({ canvas: skyCanvas, antialias: true, alpha: true });
skyRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
skyRenderer.setSize(skyCanvas.clientWidth, skyCanvas.clientHeight);
skyRenderer.setClearColor(0x070a12, 1);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070a12);
const skyScene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();
const domeTexture = textureLoader.load('./assets/dome2.jpg');
domeTexture.colorSpace = THREE.SRGBColorSpace;
domeTexture.wrapS = THREE.RepeatWrapping;
domeTexture.wrapT = THREE.RepeatWrapping;
domeTexture.repeat.set(1, 1);

const camera = new THREE.PerspectiveCamera(90, mainCanvas.clientWidth / mainCanvas.clientHeight, 0.5, 500);
camera.position.set(0, 55, 110);
camera.lookAt(0, 14, 0);

const skyCamera = new THREE.PerspectiveCamera(18, skyCanvas.clientWidth / skyCanvas.clientHeight, 0.1, 500);
skyCamera.position.set(0, 0, 0);

let planetMeshesMain = [];
let planetMeshesView = [];
const keyState = new Map();
const ui = setupUI();
const altSlider = document.getElementById('altSlider');
const timeSlider = document.getElementById('timeSlider');

const altSliderValue =
  document.getElementById('altSliderValue');

const timeSliderValue =
  document.getElementById('timeSliderValue');

const state = {
  az: 180,
  alt: 45,
  baseTime : new Date("2026-06-24T19:00:00+05:30"),
  time:new Date(),
  timeRunning: false
};
let time= state.baseTime;
window.state = state;
window.planets = planets;
window.raDecToAltAz = raDecToAltAz;
window.KOLKATA = KOLKATA;

const skyRadius = 120;
const telescopeHeight = 6;
let constellationLabels=[]

const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
sunLight.position.set(40, 80, 20);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(1024, 1024);
sunLight.shadow.camera.left = -60;
sunLight.shadow.camera.right = 60;
sunLight.shadow.camera.top = 60;
sunLight.shadow.camera.bottom = -60;
scene.add(sunLight);

scene.add(new THREE.AmbientLight(0x1b2a44, 0.5));

 

const telescope = buildTelescope();
scene.add(telescope);
 

const skyGroupMain = new THREE.Group();
const skyGroupView = new THREE.Group();
scene.add(skyGroupMain);
skyScene.add(skyGroupView);
scene.add(buildGround());

const stars = [
  ...prominentStars,
  ...planets,
  ...generateProceduralStars(900)
];
let starPointsMain;
let starPointsView;
let constellationLinesMain = [];
let constellationLinesView = [];
let labelSprites = [];
let planetLabels = [];
 

function buildPlanetLabels() {
  planets.forEach(planet => {
    const sprite = createLabelSprite(planet.name);
    sprite.userData = { planet };
    planetLabels.push(sprite);
    skyGroupView.add(sprite);   // right panel only
  });
}

function updatePlanetLabels() {
  const labelRadius = skyRadius - 4;   // distance from centre to label

  planetLabels.forEach(sprite => {
    const planet = sprite.userData.planet;
    const altAz = raDecToAltAz(
      planet.ra, planet.dec, state.time, KOLKATA.lat, KOLKATA.lon
    );

    if (altAz.altDeg <= 0) {
      sprite.visible = false;
      return;
    }

    const pos = altAzToVector(altAz.altDeg, altAz.azDeg);

    // ---- apply a small offset upward (world Y) ----
    const up = { x: 0, y: 1, z: 0 };
    const offsetAmount = 0.12;   // adjust to move label higher (0.1–0.2 works well)

    const shifted = {
      x: pos.x + up.x * offsetAmount,
      y: pos.y + up.y * offsetAmount,
      z: pos.z + up.z * offsetAmount
    };

    // Normalise and push out to the label radius
    const len = Math.sqrt(shifted.x ** 2 + shifted.y ** 2 + shifted.z ** 2);
    sprite.position.set(
      (shifted.x / len) * labelRadius,
      (shifted.y / len) * labelRadius,
      (shifted.z / len) * labelRadius
    );

    sprite.visible = true;
  });
}
let cachedDate = null;

const laserGroup = buildLaser();
scene.add(laserGroup);

const hitMarker = new THREE.Mesh(
  new THREE.SphereGeometry(1.1, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0x7ad7ff, transparent: true, opacity: 0.9 })
);
scene.add(hitMarker);

const crosshair = buildCrosshair();
skyScene.add(crosshair);

const clock = new THREE.Clock();

initSky();
updateSky();
function buildGround() {

  const radius = 500;

  const geometry =
    new THREE.SphereGeometry(
      radius,
      64,
      32
    );

  const material =
    new THREE.MeshStandardMaterial({

      color: 0x4a5e2f,

      roughness: 0.95,

      metalness: 0.0
    });

  const ground =
    new THREE.Mesh(
      geometry,
      material
    );

  // slightly above true horizon
  ground.position.set(
    0,
    -radius + 2,
    0
  );

  ground.receiveShadow = true;

  return ground;
}
function updateNightTime(totalMinutes) {

  const date = new Date(state.baseTime);

  date.setHours(0, 0, 0, 0);

  date.setMinutes(totalMinutes);

  state.time = date;

  const hours =
    Math.floor(totalMinutes / 60) % 24;

  const minutes =
    totalMinutes % 60;

  timeSliderValue.textContent =
    `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
}
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(0.033, clock.getDelta());

  handleInput(dt);
  updateTime(dt);
  updateSky();
  updateLaser();
  updateTelescopeAim();
 
  const targetInfo = findSkyViewTarget();
  updateUI(ui, {
    az: state.az,
    alt: state.alt,
    localTime: formatLocalTime(state.time),
    nearest: targetInfo.nearest,
    skyInfo: targetInfo.label
  });

  renderer.render(scene, camera);
  skyRenderer.render(skyScene, skyCamera);
}

animate();

window.addEventListener('resize', () => {
  renderer.setSize(mainCanvas.clientWidth, mainCanvas.clientHeight);
  camera.aspect = mainCanvas.clientWidth / mainCanvas.clientHeight;
  camera.updateProjectionMatrix();

  skyRenderer.setSize(skyCanvas.clientWidth, skyCanvas.clientHeight);
  skyCamera.aspect = skyCanvas.clientWidth / skyCanvas.clientHeight;
  skyCamera.updateProjectionMatrix();
});
document.addEventListener('fullscreenchange', () => {
  // small delay to let the layout settle
  setTimeout(() => {
    renderer.setSize(mainCanvas.clientWidth, mainCanvas.clientHeight);
    camera.aspect = mainCanvas.clientWidth / mainCanvas.clientHeight;
    camera.updateProjectionMatrix();

    skyRenderer.setSize(skyCanvas.clientWidth, skyCanvas.clientHeight);
    skyCamera.aspect = skyCanvas.clientWidth / skyCanvas.clientHeight;
    skyCamera.updateProjectionMatrix();
  }, 50);
});

// also cover vendor-prefixed events
document.addEventListener('webkitfullscreenchange', () => {
  setTimeout(() => {
    renderer.setSize(mainCanvas.clientWidth, mainCanvas.clientHeight);
    camera.aspect = mainCanvas.clientWidth / mainCanvas.clientHeight;
    camera.updateProjectionMatrix();
    skyRenderer.setSize(skyCanvas.clientWidth, skyCanvas.clientHeight);
    skyCamera.aspect = skyCanvas.clientWidth / skyCanvas.clientHeight;
    skyCamera.updateProjectionMatrix();
  }, 50);
});
altSlider.addEventListener('input', () => {

  state.alt =
    Number(altSlider.value);

  altSliderValue.textContent =
    `${state.alt.toFixed(1)}°`;
});

timeSlider.addEventListener('input', () => {

  const sliderMinutes =
    Number(timeSlider.value);

  const date = new Date(state.baseTime);

  date.setHours(0, 0, 0, 0);

  date.setMinutes(sliderMinutes);

  state.time = date;

  const hours =
    Math.floor(sliderMinutes / 60) % 24;

  const minutes =
    sliderMinutes % 60;

  timeSliderValue.textContent =
    `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
});
window.addEventListener('keydown', (event) => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', '[', ']'].includes(event.key)) {
    event.preventDefault();
  }
  if (event.repeat) return;
  if (event.key === 'r' || event.key === 'R') {
    state.az = 180;
    state.alt = 45;
  }
  if (event.key === 't' || event.key === 'T') {
    state.timeRunning = !state.timeRunning;
  }
  if (event.key === '[') {
    state.time = new Date(state.time.getTime() - 10 * 60000);
  }
  if (event.key === ']') {
    state.time = new Date(state.time.getTime() + 10 * 60000);
  }
  keyState.set(event.key, true);
});

window.addEventListener('keyup', (event) => {
  keyState.set(event.key, false);
});

window.addEventListener('blur', () => keyState.clear());

function handleInput(dt) {

  const ROT_SPEED = 45;
  const ALT_SPEED = 25;
  const TIME_SPEED = 120;

  // AZIMUTH LEFT
  if (keyState.get('ArrowLeft')) {
    state.az -= ROT_SPEED * dt;
    if (state.az < 0) state.az += 360;
    azSlider.value = state.az;
    azSliderValue.textContent = `${state.az.toFixed(1)}°`;
  }

  // AZIMUTH RIGHT
  if (keyState.get('ArrowRight')) {
    state.az += ROT_SPEED * dt;
    if (state.az >= 360) state.az -= 360;
    azSlider.value = state.az;
    azSliderValue.textContent = `${state.az.toFixed(1)}°`;
  }

  // ALTITUDE DOWN (Q) – stops at 0° (horizon)
  if (keyState.get('q') || keyState.get('Q')) {
    state.alt = Math.max(0, state.alt - ALT_SPEED * dt);
    altSlider.value = state.alt;
    altSliderValue.textContent = `${state.alt.toFixed(1)}°`;
  }

  // ALTITUDE UP (E) – stops at 90° (zenith)
  if (keyState.get('e') || keyState.get('E')) {
    state.alt = Math.min(90, state.alt + ALT_SPEED * dt);
    altSlider.value = state.alt;
    altSliderValue.textContent = `${state.alt.toFixed(1)}°`;
  }

  // TIME BACKWARD (A)
  if (keyState.get('a') || keyState.get('A')) {
    let mins = Number(timeSlider.value);
    mins -= TIME_SPEED * dt;
    mins = Math.max(1140, mins);
    timeSlider.value = mins;
    updateNightTime(mins);
  }

  // TIME FORWARD (D)
  if (keyState.get('d') || keyState.get('D')) {
    let mins = Number(timeSlider.value);
    mins += TIME_SPEED * dt;
    mins = Math.min(1800, mins);
    timeSlider.value = mins;
    updateNightTime(mins);
  }
}
function updateTime(dt) {
  if (state.timeRunning) {
    state.time = new Date(state.time.getTime() + dt * 60000);
  }
}
 

 function buildTelescope() {

    const telescope = new THREE.Group();

    //----------------------------------------------------
    // Rotation hierarchy
    //----------------------------------------------------

    const azGroup = new THREE.Group();
    const altGroup = new THREE.Group();

    telescope.add(azGroup);
    azGroup.add(altGroup);

    telescope.userData = {

        loaded: false,

        azGroup,

        altGroup,

        model: null,

        laserOrigin: null

    };

    //----------------------------------------------------
    // Load Materials
    //----------------------------------------------------

    const mtlLoader = new MTLLoader();

    mtlLoader.load(

        "./NightObservatory.mtl",

        (materials) => {

            materials.preload();

            const objLoader = new OBJLoader();

            objLoader.setMaterials(materials);

            objLoader.load(

                "./NightObservatory.obj",

                (model) => {

                    //------------------------------------------------
                    // Scale (1/10 previous size)
                    //------------------------------------------------

                    model.scale.setScalar(0.225);

                    //------------------------------------------------
                    // Initial orientation
                    //------------------------------------------------

                    model.rotation.y = Math.PI*0.5;          // 180°

                     // 90°

                    //------------------------------------------------
                    // Shadows
                    //------------------------------------------------

                    model.traverse((child) => {

                        if (child.isMesh) {

                            child.castShadow = true;
                            child.receiveShadow = true;

                        }

                    });

                    //------------------------------------------------
                    // Bounding Box
                    //------------------------------------------------

                    const box = new THREE.Box3().setFromObject(model);

                    const size = new THREE.Vector3();
                    const centre = new THREE.Vector3();

                    box.getSize(size);
                    box.getCenter(centre);

                    //------------------------------------------------
                    // Centre on Observatory Pier
                    //------------------------------------------------

                    model.position.x -= centre.x;
                    model.position.z -= centre.z;
                    model.position.y -= box.min.y;

                    //------------------------------------------------
                    // Add model
                    //------------------------------------------------

                    altGroup.add(model);

                    //------------------------------------------------
                    // Laser Origin
                    //------------------------------------------------

                    const laserOrigin = new THREE.Object3D();

                    /*
                     * Front-top of telescope.
                     * These offsets work much better than the previous
                     * hard-coded (0,1.6,4.5) for the ESA model.
                     */

                    laserOrigin.position.set(

                        0,

                        size.y * 0.60,

                        size.z * 0.48

                    );

                    model.add(laserOrigin);

                    //------------------------------------------------
                    // Save references
                    //------------------------------------------------

                    telescope.userData.model = model;
                    telescope.userData.laserOrigin = laserOrigin;
                    telescope.userData.loaded = true;

                    console.log("ESA Telescope Loaded");

                },

                undefined,

                (err) => {

                    console.error(err);

                }

            );

        },

        undefined,

        (err) => {

            console.error(err);

        }

    );

    return telescope;

}
 

function buildLaser() {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0x7ad7ff, transparent: true, opacity: 0.85 });
  const geometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 12);
  const beam = new THREE.Mesh(geometry, material);
  beam.position.y = telescopeHeight + 2;
  group.add(beam);
  group.userData.beam = beam;
  return group;
}

function buildCrosshair() {
  const material = new THREE.LineBasicMaterial({ color: 0x7ad7ff, transparent: true, opacity: 0.7 });
  const points = [
    new THREE.Vector3(-2, 0, 0),
    new THREE.Vector3(-0.4, 0, 0),
    new THREE.Vector3(0.4, 0, 0),
    new THREE.Vector3(2, 0, 0),
    new THREE.Vector3(0, -2, 0),
    new THREE.Vector3(0, -0.4, 0),
    new THREE.Vector3(0, 0.4, 0),
    new THREE.Vector3(0, 2, 0)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.LineSegments(geometry, material);
  line.position.z = -40;
  return line;
}

function initSky() {
  skyGroupMain.clear();
  skyGroupView.clear();
  labelSprites = [];
  constellationLabels = [];

  // 1. FILTER OUT planets from the background star vertex array to prevent overlapping artifact dots
  const pureStars = stars.filter(star => !planets.some(p => p.name === star.name));

  // ---- Star points setup ----
  const starGeom = new THREE.BufferGeometry();
  const positions = new Float32Array(pureStars.length * 3);
  const colors = new Float32Array(pureStars.length * 3);
  const sizes = new Float32Array(pureStars.length);

  pureStars.forEach((star, i) => {
    positions[i * 3] = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;
    sizes[i] = Math.max(0.6, 3.5 - star.mag);
    const intensity = Math.max(0.3, 1.4 - star.mag * 0.2);
    colors[i * 3] = intensity;
    colors[i * 3 + 1] = intensity;
    colors[i * 3 + 2] = intensity * 1.1;
  });

  starGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const starMat = new THREE.PointsMaterial({
    vertexColors: true,
    size: 1.5,
    sizeAttenuation: true,
    transparent: true
  });

  starPointsMain = new THREE.Points(starGeom.clone(), starMat);
  starPointsView = new THREE.Points(starGeom.clone(), starMat.clone());
  skyGroupMain.add(starPointsMain);
  skyGroupView.add(starPointsView);

  // ── Realistic textured planet spheres ──
  const textureLoader = new THREE.TextureLoader();

  const textureFiles = {
    Mercury: 'mercury.png',
    Venus:   'venus.png',
    Mars:    'mars.png',
    Jupiter: 'jupiter.png',
    Saturn:  'saturn.png',
    Moon:    'moon.png'
  };

  const planetSizes = {
    Mercury: 0.5,
    Venus:   0.8,
    Mars:    0.6,
    Jupiter: 1.2,
    Saturn:  1.0,
    Moon:    1.5
  };

  planetMeshesMain = [];
  planetMeshesView = [];

  planets.forEach(p => {
    const radius = planetSizes[p.name] || 0.7;
    const geom = new THREE.SphereGeometry(radius, 48, 48);

    const fileName = textureFiles[p.name];
    const fallbackCol = new THREE.Color(p.color);

    let matMain, matView;
    if (fileName) {
      const tex = textureLoader.load(fileName);
      tex.colorSpace = THREE.SRGBColorSpace;
      matMain = new THREE.MeshBasicMaterial({ map: tex });
      matView = new THREE.MeshBasicMaterial({ map: tex.clone() });
    } else {
      matMain = new THREE.MeshBasicMaterial({ color: fallbackCol });
      matView = new THREE.MeshBasicMaterial({ color: fallbackCol });
    }

    const sphereMain = new THREE.Mesh(geom, matMain);
    sphereMain.userData = { planet: p };
    skyGroupMain.add(sphereMain);
    planetMeshesMain.push(sphereMain);

    const sphereView = new THREE.Mesh(geom, matView);
    sphereView.userData = { planet: p };
    skyGroupView.add(sphereView);
    planetMeshesView.push(sphereView);

    if (p.name === 'Saturn') {
      const ringGeo = new THREE.RingGeometry(radius * 1.4, radius * 2.0, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xc2b280,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2 + 0.1;
      sphereMain.add(ring);
    }
  });

  buildConstellations();
  buildLabels();
  buildPlanetLabels();
  buildConstellationLabels();
}

 function updateSky() {
  const dateKey = state.time.toISOString();
  if (cachedDate === dateKey) return;
  cachedDate = dateKey;

  // ── Star points ──────────────────────────────
  const positionsMain = starPointsMain.geometry.attributes.position.array;
  const colorsMain   = starPointsMain.geometry.attributes.color.array;
  const positionsView = starPointsView.geometry.attributes.position.array;
  const colorsView   = starPointsView.geometry.attributes.color.array;

  stars.forEach((star, i) => {
    const { altDeg, azDeg } = raDecToAltAz(
      star.ra, star.dec, state.time, KOLKATA.lat, KOLKATA.lon
    );

    if (altDeg <= 0) {
      positionsMain[i * 3] = 99999;
      positionsMain[i * 3 + 1] = 99999;
      positionsMain[i * 3 + 2] = 99999;
      positionsView[i * 3] = 99999;
      positionsView[i * 3 + 1] = 99999;
      positionsView[i * 3 + 2] = 99999;
      colorsMain[i * 3] = 0;
      colorsMain[i * 3 + 1] = 0;
      colorsMain[i * 3 + 2] = 0;
      colorsView[i * 3] = 0;
      colorsView[i * 3 + 1] = 0;
      colorsView[i * 3 + 2] = 0;
      return;
    }

    const pos = altAzToVector(altDeg, azDeg);
    positionsMain[i * 3] = pos.x * skyRadius;
    positionsMain[i * 3 + 1] = pos.y * skyRadius;
    positionsMain[i * 3 + 2] = pos.z * skyRadius;
    positionsView[i * 3] = pos.x * skyRadius;
    positionsView[i * 3 + 1] = pos.y * skyRadius;
    positionsView[i * 3 + 2] = pos.z * skyRadius;

    const brightness = Math.max(0.4, 1.6 - star.mag * 0.2);
    colorsMain[i * 3] = brightness;
    colorsMain[i * 3 + 1] = brightness;
    colorsMain[i * 3 + 2] = brightness * 1.1;
    colorsView[i * 3] = brightness;
    colorsView[i * 3 + 1] = brightness;
    colorsView[i * 3 + 2] = brightness * 1.1;
  });

  starPointsMain.geometry.attributes.position.needsUpdate = true;
  starPointsMain.geometry.attributes.color.needsUpdate = true;
  starPointsView.geometry.attributes.position.needsUpdate = true;
  starPointsView.geometry.attributes.color.needsUpdate = true;

  // ── Planet spheres (replaces old planet dots) ──
  planetMeshesMain.forEach(sphere => {
    const p = sphere.userData.planet;
    const { altDeg, azDeg } = raDecToAltAz(p.ra, p.dec, state.time, KOLKATA.lat, KOLKATA.lon);
    if (altDeg <= 0) {
      sphere.position.set(99999, 99999, 99999);
    } else {
      const pos = altAzToVector(altDeg, azDeg);
      sphere.position.set(pos.x * skyRadius, pos.y * skyRadius, pos.z * skyRadius);
    }
  });

  planetMeshesView.forEach(sphere => {
    const p = sphere.userData.planet;
    const { altDeg, azDeg } = raDecToAltAz(p.ra, p.dec, state.time, KOLKATA.lat, KOLKATA.lon);
    if (altDeg <= 0) {
      sphere.position.set(99999, 99999, 99999);
    } else {
      const pos = altAzToVector(altDeg, azDeg);
      sphere.position.set(pos.x * skyRadius, pos.y * skyRadius, pos.z * skyRadius);
    }
  });

  // ── Constellation lines, labels, planet labels ──
  updateConstellations();
  updateLabels();
  updatePlanetLabels();
  updateConstellationLabels();
}
function buildConstellations() {
  constellationLinesMain.forEach(line => skyGroupMain.remove(line));
  constellationLinesView.forEach(line => skyGroupView.remove(line));

  constellationLinesMain = [];
  constellationLinesView = [];

  const lineMatMain = new THREE.LineBasicMaterial({
    color: 0x7ec3ff,
    transparent: true,
    opacity: 0.9,
    depthTest: false,
    depthWrite: false
  });

  const lineMatView = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1.0,
    depthTest: false,
    depthWrite: false
  });

  constellations.forEach(cons => {
    cons.lines.forEach(pair => {

      const geomMain = new THREE.BufferGeometry();
      geomMain.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(6), 3)
      );

      const geomView = new THREE.BufferGeometry();
      geomView.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(6), 3)
      );

      const lineMain = new THREE.Line(
        geomMain,
        lineMatMain
      );

      const lineView = new THREE.Line(
        geomView,
        lineMatView
      );

      lineMain.userData = {
        stars: pair,
        constellation: cons.name
      };

      lineView.userData = {
        stars: pair,
        constellation: cons.name
      };

      lineMain.frustumCulled = false;
      lineView.frustumCulled = false;

      constellationLinesMain.push(lineMain);
      constellationLinesView.push(lineView);

      skyGroupMain.add(lineMain);
      skyGroupView.add(lineView);
    });
  });
}

function updateConstellations() {
  updateConstellationLines(constellationLinesMain);
  updateConstellationLines(constellationLinesView);
}

function updateConstellationLines(lines) {

  lines.forEach(line => {

    const [aName, bName] =
      line.userData.stars;

    const a =
      stars.find(
        s => s.name === aName
      );

    const b =
      stars.find(
        s => s.name === bName
      );

    if (!a || !b) {

      line.visible = false;

      return;
    }

    const aAltAz =
      raDecToAltAz(
        a.ra,
        a.dec,
        state.time,
        KOLKATA.lat,
        KOLKATA.lon
      );

    const bAltAz =
      raDecToAltAz(
        b.ra,
        b.dec,
        state.time,
        KOLKATA.lat,
        KOLKATA.lon
      );

    // HIDE IF EITHER STAR BELOW HORIZON
    if (
      aAltAz.altDeg <= 0 ||
      bAltAz.altDeg <= 0
    ) {

      line.visible = false;

      return;
    }

    line.visible = true;

    const aVec =
      altAzToVector(
        aAltAz.altDeg,
        aAltAz.azDeg
      );

    const bVec =
      altAzToVector(
        bAltAz.altDeg,
        bAltAz.azDeg
      );

    const r =
      skyRadius - 1;

    const pos =
      line.geometry.attributes.position.array;

    pos[0] = aVec.x * r;
    pos[1] = aVec.y * r;
    pos[2] = aVec.z * r;

    pos[3] = bVec.x * r;
    pos[4] = bVec.y * r;
    pos[5] = bVec.z * r;

    line.geometry.attributes.position.needsUpdate = true;

    line.geometry.computeBoundingSphere();
  });
}
function buildLabels() {
  const labelStars = prominentStars.filter(star => star.name && star.mag <= 0.5);
  labelStars.forEach(star => {
    const sprite = createLabelSprite(star.name);
    sprite.userData = { star };
    labelSprites.push(sprite);
    skyGroupView.add(sprite);
  });
}
 

function updateLabels() {
  labelSprites.forEach(sprite => {
    const star = sprite.userData.star;
    const altAz = raDecToAltAz(star.ra, star.dec, state.time, KOLKATA.lat, KOLKATA.lon);
    const vec = altAzToVector(altAz.altDeg, altAz.azDeg);
    sprite.position.set(vec.x * (skyRadius - 4), vec.y * (skyRadius - 4), vec.z * (skyRadius - 4));
    sprite.visible = altAz.altDeg > 0;
  });
}
 
function updateConstellationLabels() {

  constellationLabels.forEach(label => {

    const stars =
      label.userData.stars;

    let x = 0;
    let y = 0;
    let z = 0;

    let visibleCount = 0;

    stars.forEach(star => {

      const altAz =
        raDecToAltAz(
          star.ra,
          star.dec,
          state.time,
          KOLKATA.lat,
          KOLKATA.lon
        );

      if (altAz.altDeg <= 0)
        return;

      const vec =
        altAzToVector(
          altAz.altDeg,
          altAz.azDeg
        );

      x += vec.x;
      y += vec.y;
      z += vec.z;

      visibleCount++;
    });

    if (visibleCount === 0) {

      label.visible = false;

      return;
    }

    x /= visibleCount;
    y /= visibleCount;
    z /= visibleCount;

    const len =
      Math.sqrt(
        x*x +
        y*y +
        z*z
      );

    x /= len;
    y /= len;
    z /= len;

    const radius =
      label.userData.mainView
        ? skyRadius - 15
        : skyRadius - 8;

    label.position.set(
      x * radius,
      y * radius,
      z * radius
    );

    label.visible = true;
  });
}

function updateLaser() {
      const origin = new THREE.Vector3();
const dir = altAzToVector(state.alt, state.az);
    if(!telescope) return;

    if(!telescope.userData.loaded) return;

    if(!telescope.userData.laserOrigin) return;

   

    telescope.userData.laserOrigin.getWorldPosition(origin);
   
 
  telescope.userData.laserOrigin.getWorldPosition(origin);
  const direction = new THREE.Vector3(dir.x, dir.y, dir.z).normalize();

  const hitPoint = intersectRaySphere(origin, direction, new THREE.Vector3(0, 0, 0), skyRadius - 0.5);
  if (hitPoint) {
    hitMarker.position.copy(hitPoint);
    laserGroup.userData.beam.scale.set(1, hitPoint.distanceTo(origin), 1);
    laserGroup.userData.beam.position.copy(origin.clone().add(direction.clone().multiplyScalar(hitPoint.distanceTo(origin) / 2)));
    laserGroup.userData.beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

    skyCamera.position.set(0, 0, 0);
    const lookTarget = hitPoint.clone().normalize().multiplyScalar(50);
    skyCamera.lookAt(lookTarget);
    const forward = lookTarget.clone().normalize();
    crosshair.position.copy(forward.multiplyScalar(40));
    crosshair.lookAt(new THREE.Vector3(0, 0, 0));
  }
}
function buildConstellationLabels() {

  constellationLabels = [];

  constellations.forEach(cons => {

    const starsInConstellation = [];

    cons.lines.forEach(pair => {

      pair.forEach(name => {

        const star =
          stars.find(
            s => s.name === name
          );

        if (star)
          starsInConstellation.push(star);
      });
    });

    if (starsInConstellation.length === 0)
      return;

    const mainLabel =
      createLabelSprite(cons.name);

    const viewLabel =
      createLabelSprite(cons.name);

    mainLabel.scale.set(
      24,
      6,
      1
    );

    viewLabel.scale.set(
      24,
      6,
      1
    );

    mainLabel.userData = {
      constellation: cons,
      stars: starsInConstellation,
      mainView: true
    };

    viewLabel.userData = {
      constellation: cons,
      stars: starsInConstellation,
      mainView: false
    };

    constellationLabels.push(mainLabel);
    constellationLabels.push(viewLabel);

    skyGroupMain.add(mainLabel);
    skyGroupView.add(viewLabel);
  });
}
 
function updateTelescopeAim() {

    if(!telescope) return;

    if(!telescope.userData.loaded) return;

   

  const azGroup =
    telescope.userData.azGroup;

  const altGroup =
    telescope.userData.altGroup;

  if (!azGroup || !altGroup) return;

  azGroup.rotation.y =
    THREE.MathUtils.degToRad(
      state.az
    );

  altGroup.rotation.x =
    THREE.MathUtils.degToRad(
      -state.alt
    );
}

function intersectRaySphere(origin, direction, center, radius) {
  const oc = origin.clone().sub(center);
  const b = 2 * oc.dot(direction);
  const c = oc.dot(oc) - radius * radius;
  const discriminant = b * b - 4 * c;
  if (discriminant < 0) return null;
  const t = (-b + Math.sqrt(discriminant)) / 2;
  if (t < 0) return null;
  return origin.clone().add(direction.clone().multiplyScalar(t));
}

function findNearestStarName() {
  const dir = altAzToVector(state.alt, state.az);
  let nearest = null;
  let best = 999;
  prominentStars.forEach(star => {
    const altAz = raDecToAltAz(star.ra, star.dec, state.time, KOLKATA.lat, KOLKATA.lon);
    if (altAz.altDeg < 0) return;
    const vec = altAzToVector(altAz.altDeg, altAz.azDeg);
    const dot = dir.x * vec.x + dir.y * vec.y + dir.z * vec.z;
    const angle = Math.acos(Math.min(1, Math.max(-1, dot))) * 180 / Math.PI;
    if (angle < best) {
      best = angle;
      nearest = `${star.name} (${angle.toFixed(1)} deg)`;
    }
  });
  return nearest;
}

function findSkyViewTarget() {
  const dir = altAzToVector(state.alt, state.az);
  let best = 999;
  let nearestStar = null;
  prominentStars.forEach(star => {
    const altAz = raDecToAltAz(star.ra, star.dec, state.time, KOLKATA.lat, KOLKATA.lon);
    if (altAz.altDeg < 0) return;
    const vec = altAzToVector(altAz.altDeg, altAz.azDeg);
    const dot = dir.x * vec.x + dir.y * vec.y + dir.z * vec.z;
    const angle = Math.acos(Math.min(1, Math.max(-1, dot))) * 180 / Math.PI;
    if (angle < best) {
      best = angle;
      nearestStar = star;
    }
  });

  const nearest = nearestStar ? `${nearestStar.name} (${best.toFixed(1)} deg)` : null;
  const constellation = nearestStar ? findConstellationForStar(nearestStar.name) : null;
  const labelParts = [];
  if (nearestStar) labelParts.push(`Star: ${nearestStar.name}`);
  if (constellation) labelParts.push(`Constellation: ${constellation}`);
  const label = labelParts.length ? labelParts.join(' | ') : 'Target: --';
  return { nearest, label };
}

function findConstellationForStar(starName) {
  for (const cons of constellations) {
    for (const pair of cons.lines) {
      if (pair.includes(starName)) return cons.name;
    }
  }
  return null;
}

function createLabelSprite(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '22px sans-serif';
  ctx.fillStyle = 'rgba(210, 230, 255, 0.9)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(22, 5.5, 1);
  return sprite;
}
