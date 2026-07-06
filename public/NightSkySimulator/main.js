import * as THREE from './vendor/three.module.js';
import { KOLKATA, raDecToAltAz, altAzToVector, formatLocalTime } from './astronomy.js';
import { prominentStars, planets,constellations, generateProceduralStars } from './skydata.js';
import { setupUI, updateUI } from './ui.js';

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

const dome = buildObservatoryDome();
scene.add(dome);

const telescope = buildTelescope();
scene.add(telescope);

const skyDome = buildSkyDome();
scene.add(skyDome);

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
  updateDomeOpening();
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

function buildObservatoryDome() {
  const group = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xd7c7a6,
    roughness: 0.75,
    map: domeTexture
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xc1b08e,
    roughness: 0.6,
    map: domeTexture
  });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6a6a66, roughness: 0.9 });

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(18.5, 18.5, 6.4, 56, 1, true),
    wallMat
  );
  base.receiveShadow = true;
  base.position.y = 3.2;

  const baseRing = new THREE.Mesh(
    new THREE.CylinderGeometry(20, 20, 2.6, 56),
    stoneMat
  );
  baseRing.position.y = 1.3;
  baseRing.receiveShadow = true;

  const domeGap = 0.7;
  const domeShell = new THREE.Mesh(
    new THREE.SphereGeometry(18.2, 56, 32, domeGap * 0.5, Math.PI * 2 - domeGap, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: 0xe5d7b8,
      roughness: 0.55,
      metalness: 0.05,
      side: THREE.FrontSide
    })
  );
  domeShell.position.y = 6.6;
  domeShell.rotation.y = Math.PI / 2;
  domeShell.castShadow = true;
  domeShell.receiveShadow = true;

  const innerLiner = new THREE.Mesh(
    new THREE.SphereGeometry(17.9, 56, 32, domeGap * 0.5, Math.PI * 2 - domeGap, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: 0x191c22,
      roughness: 0.9,
      metalness: 0.0,
      side: THREE.BackSide
    })
  );
  innerLiner.position.y = 6.6;
  innerLiner.rotation.y = Math.PI / 2;

  const slitRim = new THREE.Mesh(
    new THREE.TorusGeometry(18.2, 0.35, 12, 48, Math.PI * 0.38),
    trimMat
  );
  slitRim.rotation.x = Math.PI / 2;
  slitRim.position.y = 6.6;
  slitRim.position.z = 0.5;

  const shutter = new THREE.Mesh(
    new THREE.BoxGeometry(9, 1.2, 5),
    trimMat
  );
  shutter.position.set(0, 12.5, 15.5);
  shutter.rotation.x = -0.65;
  shutter.castShadow = true;

  const slitGroup = new THREE.Group();
  slitGroup.add(slitRim, shutter);
  slitGroup.rotation.y = Math.PI / 2;

  const panelMat = new THREE.MeshStandardMaterial({ color: 0xd0c1a2, roughness: 0.8 });
  const panelGeo = new THREE.BoxGeometry(6.5, 4.8, 0.6);
  const panel1 = new THREE.Mesh(panelGeo, panelMat);
  panel1.position.set(0, 3.5, 18.1);

  const door = new THREE.Mesh(new THREE.BoxGeometry(6, 5, 0.5), new THREE.MeshStandardMaterial({ color: 0xd8c7a8, roughness: 0.7 }));
  door.position.set(0, 3.2, 18.4);
  const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 1.2), new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.4 }));
  hinge.position.set(2.7, 4.1, 18.9);
  const hinge2 = hinge.clone();
  hinge2.position.y = 2.4;
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.4), new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.4 }));
  handle.position.set(-2.2, 3.2, 18.9);

  const stepsMat = new THREE.MeshStandardMaterial({ color: 0x61743a, roughness: 0.9 });
  const step1 = new THREE.Mesh(new THREE.BoxGeometry(7, 1.6, 4), stepsMat);
  const step2 = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.4, 3.2), stepsMat);
  step1.position.set(0, 0.8, 22.5);
  step2.position.set(0, 2.1, 20.8);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(18.2, 64),
    new THREE.MeshStandardMaterial({ color: 0x141926, roughness: 0.9 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;

  const domeTop = new THREE.Group();
  domeTop.add(domeShell, innerLiner, slitGroup);
  domeTop.position.y = 0;

  group.add(base, baseRing, domeTop, panel1, door, hinge, hinge2, handle, step1, step2, floor);
  group.userData.slitGroup = slitGroup;
  group.userData.domeTop = domeTop;
  return group;
}

function buildTelescope() {

    const group = new THREE.Group();

    //--------------------------------------------------
    // MATERIALS
    //--------------------------------------------------

    const whiteMat = new THREE.MeshPhysicalMaterial({
        color: 0xf6f6f6,
        metalness: 0.45,
        roughness: 0.18,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03
    });

    const darkMat = new THREE.MeshStandardMaterial({
        color: 0x3b414d,
        metalness: 0.75,
        roughness: 0.28
    });

    const blackMat = new THREE.MeshStandardMaterial({
        color: 0x1b1b1b,
        metalness: 0.55,
        roughness: 0.42
    });

    const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xdadada,
        metalness: 1,
        roughness: 0.12
    });

    const rubberMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.95
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x99d8ff,
        transmission: 0.98,
        transparent: true,
        opacity: 0.45,
        roughness: 0,
        metalness: 0,
        ior: 1.52,
        thickness: 0.5
    });

    //--------------------------------------------------
    // OBSERVATORY BASE
    //--------------------------------------------------

    const base = new THREE.Mesh(

        new THREE.CylinderGeometry(
            5.3,
            5.6,
            1.5,
            64
        ),

        darkMat

    );

    base.position.y = 0.75;

    base.castShadow = true;
    base.receiveShadow = true;

    group.add(base);

    //--------------------------------------------------
    // RUBBER FEET
    //--------------------------------------------------

    for(let i=0;i<8;i++){

        const foot=new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.28,
                0.32,
                0.15,
                20
            ),

            rubberMat

        );

        const a=i*Math.PI/4;

        foot.position.set(

            Math.cos(a)*4.4,

            0.08,

            Math.sin(a)*4.4

        );

        group.add(foot);

    }

    //--------------------------------------------------
    // OBSERVATORY PIER
    //--------------------------------------------------

    const pier=new THREE.Mesh(

        new THREE.CylinderGeometry(

            2.9,
            3.3,
            telescopeHeight,
            64

        ),

        darkMat

    );

    pier.position.y=telescopeHeight/2;

    pier.castShadow=true;
    pier.receiveShadow=true;

    group.add(pier);

    //--------------------------------------------------
    // PIER FLANGES
    //--------------------------------------------------

    const lowerFlange=new THREE.Mesh(

        new THREE.CylinderGeometry(
            3.6,
            3.6,
            0.4,
            64
        ),

        blackMat

    );

    lowerFlange.position.y=0.45;

    group.add(lowerFlange);

    const upperFlange=lowerFlange.clone();

    upperFlange.position.y=telescopeHeight-0.3;

    group.add(upperFlange);

    //--------------------------------------------------
    // PIER BOLTS
    //--------------------------------------------------

    for(let i=0;i<16;i++){

        const bolt=new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.07,
                0.07,
                0.18,
                12
            ),

            chromeMat

        );

        const angle=i*Math.PI/8;

        bolt.position.set(

            Math.cos(angle)*3.2,

            telescopeHeight-0.05,

            Math.sin(angle)*3.2

        );

        group.add(bolt);

    }

    //--------------------------------------------------
    // AZIMUTH GROUP
    //--------------------------------------------------

    const azGroup=new THREE.Group();

    azGroup.position.y=telescopeHeight+0.4;

    //--------------------------------------------------
    // ROTATING BASE
    //--------------------------------------------------

    const mountBase=new THREE.Mesh(

        new THREE.CylinderGeometry(
            3.8,
            4.0,
            1.6,
            64
        ),

        blackMat

    );

    mountBase.castShadow=true;

    azGroup.add(mountBase);

    //--------------------------------------------------
    // AZIMUTH ENCODER DISC
    //--------------------------------------------------

    const encoder=new THREE.Mesh(

        new THREE.TorusGeometry(
            3.15,
            0.09,
            20,
            80
        ),

        chromeMat

    );

    encoder.rotation.x=Math.PI/2;

    encoder.position.y=0.82;

    azGroup.add(encoder);

    //--------------------------------------------------
    // MOTOR HOUSING
    //--------------------------------------------------

    const motorHousing=new THREE.Mesh(

        new THREE.BoxGeometry(
            2.4,
            1.6,
            2.0
        ),

        darkMat

    );

    motorHousing.position.set(

        0,

        0.4,

        -3.4

    );

    azGroup.add(motorHousing);

    //--------------------------------------------------
    // FORK ARMS
    //--------------------------------------------------

    const leftFork=new THREE.Mesh(

        new THREE.BoxGeometry(
            0.8,
            5.8,
            1.4
        ),

        darkMat

    );

    leftFork.position.set(

        -2.35,

        3.0,

        0

    );

    leftFork.castShadow=true;

    azGroup.add(leftFork);

    const rightFork=leftFork.clone();

    rightFork.position.x=2.35;

    azGroup.add(rightFork);

    //--------------------------------------------------
    // FORK BRACES
    //--------------------------------------------------

    for(let side=-1;side<=1;side+=2){

        const brace=new THREE.Mesh(

            new THREE.BoxGeometry(
                0.25,
                2.6,
                0.25
            ),

            blackMat

        );

        brace.position.set(

            side*2.35,

            2.2,

            0.5

        );

        brace.rotation.z=side*0.35;

        azGroup.add(brace);

    }

    //--------------------------------------------------
    // ALTITUDE BEARINGS
    //--------------------------------------------------

    const leftBearing=new THREE.Mesh(

        new THREE.CylinderGeometry(
            1.15,
            1.15,
            0.45,
            48
        ),

        chromeMat

    );

    leftBearing.rotation.z=Math.PI/2;

    leftBearing.position.set(

        -2.35,

        5.1,

        0

    );

    azGroup.add(leftBearing);

    const rightBearing=leftBearing.clone();

    rightBearing.position.x=2.35;

    azGroup.add(rightBearing);

    //--------------------------------------------------
    // ALTITUDE GROUP
    //--------------------------------------------------

    const altGroup=new THREE.Group();

    altGroup.position.y=5.1;
        //--------------------------------------------------
    // MAIN OPTICAL TUBE
    //--------------------------------------------------

    const tubeLength = 14;
    const tubeRadius = 1.9;

    const tube = new THREE.Mesh(

        new THREE.CylinderGeometry(
            tubeRadius,
            tubeRadius,
            tubeLength,
            80,
            1,
            false
        ),

        whiteMat

    );

    tube.rotation.x = Math.PI/2;

    tube.castShadow = true;
    tube.receiveShadow = true;

    altGroup.add(tube);

    //--------------------------------------------------
    // CARBON FIBRE REINFORCEMENT RIBS
    //--------------------------------------------------

    for(let i=0;i<14;i++){

        const rib = new THREE.Mesh(

            new THREE.TorusGeometry(
                tubeRadius+0.01,
                0.03,
                12,
                64
            ),

            darkMat

        );

        rib.rotation.x=Math.PI/2;

        rib.position.z=-6.6+i*1.0;

        altGroup.add(rib);

    }

    //--------------------------------------------------
    // FRONT DEW SHIELD
    //--------------------------------------------------

    const dewShield=new THREE.Mesh(

        new THREE.CylinderGeometry(

            2.12,
            2.12,
            3.2,
            80,
            1,
            true

        ),

        whiteMat

    );

    dewShield.rotation.x=Math.PI/2;

    dewShield.position.z=8.6;

    altGroup.add(dewShield);

    //--------------------------------------------------
    // FRONT RETAINING RING
    //--------------------------------------------------

    const frontRing=new THREE.Mesh(

        new THREE.TorusGeometry(
            2.12,
            0.08,
            16,
            80
        ),

        chromeMat

    );

    frontRing.rotation.x=Math.PI/2;

    frontRing.position.z=7.05;

    altGroup.add(frontRing);

    //--------------------------------------------------
    // CORRECTOR GLASS
    //--------------------------------------------------

    const correctorGlass=new THREE.Mesh(

        new THREE.CircleGeometry(
            1.95,
            80
        ),

        glassMat

    );

    correctorGlass.rotation.x=Math.PI/2;

    correctorGlass.position.z=7.02;

    altGroup.add(correctorGlass);

    //--------------------------------------------------
    // INTERNAL BAFFLES
    //--------------------------------------------------

    for(let i=0;i<8;i++){

        const baffle=new THREE.Mesh(

            new THREE.TorusGeometry(
                1.65-(i*0.05),
                0.04,
                10,
                48
            ),

            blackMat

        );

        baffle.rotation.x=Math.PI/2;

        baffle.position.z=5.8-(i*1.0);

        altGroup.add(baffle);

    }

    //--------------------------------------------------
    // TUBE RINGS
    //--------------------------------------------------

    const ringGroup1=new THREE.Group();

    const outerRing1=new THREE.Mesh(

        new THREE.TorusGeometry(
            2.03,
            0.16,
            20,
            80
        ),

        darkMat

    );

    outerRing1.rotation.x=Math.PI/2;

    ringGroup1.add(outerRing1);

    for(let i=0;i<8;i++){

        const bolt=new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.05,
                0.05,
                0.14,
                12
            ),

            chromeMat

        );

        const a=i*Math.PI/4;

        bolt.position.set(

            Math.cos(a)*2.03,

            Math.sin(a)*2.03,

            0

        );

        bolt.rotation.z=Math.PI/2;

        ringGroup1.add(bolt);

    }

    ringGroup1.position.z=-2.7;

    altGroup.add(ringGroup1);

    //--------------------------------------------------

    const ringGroup2=ringGroup1.clone();

    ringGroup2.position.z=2.7;

    altGroup.add(ringGroup2);

    //--------------------------------------------------
    // DOVETAIL RAIL
    //--------------------------------------------------

    const rail=new THREE.Mesh(

        new THREE.BoxGeometry(

            0.35,

            0.55,

            11.5

        ),

        blackMat

    );

    rail.position.y=-2.05;

    altGroup.add(rail);

    //--------------------------------------------------
    // TOP ACCESSORY RAIL
    //--------------------------------------------------

    const topRail=rail.clone();

    topRail.position.y=2.05;

    altGroup.add(topRail);

    //--------------------------------------------------
    // SPIDER VANES
    //--------------------------------------------------

    for(let i=0;i<4;i++){

        const vane=new THREE.Mesh(

            new THREE.BoxGeometry(

                0.03,

                1.65,

                0.02

            ),

            blackMat

        );

        vane.rotation.z=i*Math.PI/2;

        vane.position.z=6.85;

        altGroup.add(vane);

    }

    //--------------------------------------------------
    // SECONDARY MIRROR
    //--------------------------------------------------

    const secondaryHousing=new THREE.Mesh(

        new THREE.SphereGeometry(

            0.38,

            32,

            32

        ),

        blackMat

    );

    secondaryHousing.position.z=6.85;

    altGroup.add(secondaryHousing);

    //--------------------------------------------------
    // FRONT COLLIMATION RING
    //--------------------------------------------------

    const collimationRing=new THREE.Mesh(

        new THREE.TorusGeometry(

            0.45,

            0.04,

            10,

            32

        ),

        chromeMat

    );

    collimationRing.rotation.x=Math.PI/2;

    collimationRing.position.z=6.82;

    altGroup.add(collimationRing);

    //--------------------------------------------------
    // MIRROR CELL
    //--------------------------------------------------

    const mirrorCell=new THREE.Mesh(

        new THREE.CylinderGeometry(

            1.95,

            1.95,

            0.55,

            64

        ),

        blackMat

    );

    mirrorCell.rotation.x=Math.PI/2;

    mirrorCell.position.z=-7.05;

    altGroup.add(mirrorCell);

    //--------------------------------------------------
    // REAR COOLING VENTS
    //--------------------------------------------------

    for(let i=0;i<12;i++){

        const vent=new THREE.Mesh(

            new THREE.BoxGeometry(

                0.12,

                0.45,

                0.05

            ),

            darkMat

        );

        const a=i*Math.PI/6;

        vent.position.set(

            Math.cos(a)*1.2,

            Math.sin(a)*1.2,

            -7.15

        );

        vent.lookAt(0,0,-20);

        altGroup.add(vent);

    }
        //--------------------------------------------------
    // REAR FOCUSER BODY
    //--------------------------------------------------

    const focuserBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55,0.60,1.8,40),
        blackMat
    );

    focuserBody.rotation.x=Math.PI/2;
    focuserBody.position.z=-8.15;

    altGroup.add(focuserBody);

    //--------------------------------------------------
    // FOCUSER DRAW TUBE
    //--------------------------------------------------

    const drawTube=new THREE.Mesh(

        new THREE.CylinderGeometry(
            0.42,
            0.42,
            1.4,
            32
        ),

        chromeMat

    );

    drawTube.rotation.x=Math.PI/2;
    drawTube.position.z=-9.55;

    altGroup.add(drawTube);

    //--------------------------------------------------
    // CAMERA ROTATOR
    //--------------------------------------------------

    const rotator=new THREE.Mesh(

        new THREE.CylinderGeometry(
            0.58,
            0.58,
            0.35,
            48
        ),

        darkMat

    );

    rotator.rotation.x=Math.PI/2;
    rotator.position.z=-9.0;

    altGroup.add(rotator);

    //--------------------------------------------------
    // CCD CAMERA
    //--------------------------------------------------

    const cameraBody=new THREE.Mesh(

        new THREE.BoxGeometry(
            1.5,
            1.5,
            1.2
        ),

        darkMat

    );

    cameraBody.position.z=-10.9;

    altGroup.add(cameraBody);

    //--------------------------------------------------
    // CAMERA FAN
    //--------------------------------------------------

    const cameraFan=new THREE.Mesh(

        new THREE.CylinderGeometry(
            0.45,
            0.45,
            0.12,
            24
        ),

        blackMat

    );

    cameraFan.rotation.x=Math.PI/2;
    cameraFan.position.z=-11.55;

    altGroup.add(cameraFan);

    //--------------------------------------------------
    // FINDER BRACKET
    //--------------------------------------------------

    const finderBracket=new THREE.Mesh(

        new THREE.BoxGeometry(
            0.25,
            0.45,
            3.6
        ),

        darkMat

    );

    finderBracket.position.set(
        0,
        2.25,
        -0.4
    );

    altGroup.add(finderBracket);

    //--------------------------------------------------
    // FINDER TUBE
    //--------------------------------------------------

    const finderTube=new THREE.Mesh(

        new THREE.CylinderGeometry(
            0.30,
            0.30,
            5.8,
            32
        ),

        whiteMat

    );

    finderTube.rotation.x=Math.PI/2;
    finderTube.position.set(
        0,
        2.75,
        -0.4
    );

    altGroup.add(finderTube);

    //--------------------------------------------------
    // FINDER OBJECTIVE
    //--------------------------------------------------

    const finderLens=new THREE.Mesh(

        new THREE.CircleGeometry(
            0.30,
            32
        ),

        glassMat

    );

    finderLens.rotation.x=Math.PI/2;
    finderLens.position.set(
        0,
        2.75,
        2.5
    );

    altGroup.add(finderLens);

    //--------------------------------------------------
    // HANDLES
    //--------------------------------------------------

    const handleGeo=new THREE.TorusGeometry(
        0.55,
        0.05,
        12,
        32
    );

    const leftHandle=new THREE.Mesh(
        handleGeo,
        chromeMat
    );

    leftHandle.rotation.y=Math.PI/2;
    leftHandle.position.set(
        -2.2,
        0,
        -1
    );

    altGroup.add(leftHandle);

    const rightHandle=leftHandle.clone();
    rightHandle.position.x=2.2;

    altGroup.add(rightHandle);

    //--------------------------------------------------
    // ALTITUDE MOTOR
    //--------------------------------------------------

    const altMotor=new THREE.Mesh(

        new THREE.BoxGeometry(
            1.4,
            1.4,
            1.4
        ),

        darkMat

    );

    altMotor.position.set(
        -3.2,
        0,
        0
    );

    altGroup.add(altMotor);

    //--------------------------------------------------
    // ENCODER DISC
    //--------------------------------------------------

    const altEncoder=new THREE.Mesh(

        new THREE.TorusGeometry(
            1.05,
            0.05,
            16,
            64
        ),

        chromeMat

    );

    altEncoder.rotation.z=Math.PI/2;

    altEncoder.position.set(
        -2.35,
        0,
        0
    );

    altGroup.add(altEncoder);

    //--------------------------------------------------
    // CABLE ROUTING
    //--------------------------------------------------

    const cableCurve=new THREE.CatmullRomCurve3([

        new THREE.Vector3(
            0,
            -0.5,
            -10
        ),

        new THREE.Vector3(
            1.5,
            -1.5,
            -7
        ),

        new THREE.Vector3(
            2.5,
            -2.5,
            -2
        ),

        new THREE.Vector3(
            2.8,
            -3.5,
            2
        )

    ]);

    const cable=new THREE.Mesh(

        new THREE.TubeGeometry(
            cableCurve,
            40,
            0.05,
            10,
            false
        ),

        rubberMat

    );

    altGroup.add(cable);

    //--------------------------------------------------
    // LASER ORIGIN
    //--------------------------------------------------

    const laserOrigin=new THREE.Object3D();

    laserOrigin.position.set(
        0,
        0,
        8.85
    );

    altGroup.add(laserOrigin);

    //--------------------------------------------------
    // ASSEMBLE
    //--------------------------------------------------

    azGroup.add(altGroup);

    group.add(azGroup);

    //--------------------------------------------------
    // USER DATA
    //--------------------------------------------------

    group.userData.azGroup=azGroup;
    group.userData.altGroup=altGroup;
    group.userData.laserOrigin=laserOrigin;

    //--------------------------------------------------
    // SHADOWS
    //--------------------------------------------------

    group.traverse(obj=>{

        if(obj.isMesh){

            obj.castShadow=true;
            obj.receiveShadow=true;

        }

    });

    //--------------------------------------------------
    // RETURN
    //--------------------------------------------------

    return group;

}
function buildSkyDome() {
  const geometry = new THREE.SphereGeometry(skyRadius, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({
    color: 0x091226,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide
  });
  const dome = new THREE.Mesh(geometry, material);
  dome.position.y = 0;
  return dome;
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
  const dir = altAzToVector(state.alt, state.az);
  const origin = new THREE.Vector3();
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
function updateDomeOpening() {
  const slitGroup = dome.userData.slitGroup;
  const domeTop = dome.userData.domeTop;
  if (!slitGroup || !domeTop) return;

  // Dome rotates with azimuth
  domeTop.rotation.y = THREE.MathUtils.degToRad(state.az);

  // Slit opens as altitude increases, fully open by 70°
  const slitAngle = Math.min(state.alt, 70) * (90 / 70);  // 0→90° rotation
  slitGroup.rotation.x = THREE.MathUtils.degToRad(-slitAngle);
}
function updateTelescopeAim() {

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
