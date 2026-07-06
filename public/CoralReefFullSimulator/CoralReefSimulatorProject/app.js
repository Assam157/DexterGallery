import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/////////////////////////////////////////////////
// SCENE
/////////////////////////////////////////////////

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b5f87);
scene.fog = new THREE.FogExp2(0x0b5f87, 0.01);

/////////////////////////////////////////////////
// CAMERA
/////////////////////////////////////////////////

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.set(0, 5, 14);

/////////////////////////////////////////////////
// RENDERER
/////////////////////////////////////////////////

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

/////////////////////////////////////////////////
// CONTROLS
/////////////////////////////////////////////////

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/////////////////////////////////////////////////
// LIGHTING
/////////////////////////////////////////////////

scene.add(new THREE.AmbientLight(0x99ccff, 2.5));

const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(40, 120, 20);
scene.add(sun);

/////////////////////////////////////////////////
// IMPROVED OCEAN FLOOR (LARGE TERRAIN)
/////////////////////////////////////////////////

 /////////////////////////////////////////////////
// REEF SHELF TERRAIN (IMPROVEMENT 4)
/////////////////////////////////////////////////

const floorGeometry =
new THREE.PlaneGeometry(

    1200,
    1200,

    100,
    100

);

const pos =
floorGeometry.attributes.position;

for(let i=0;i<pos.count;i++){

    const x =
    pos.getX(i);

    const y =
    pos.getY(i);

    let height = 0;

    //////////////////////////////////////////////////
    // LARGE SCALE SHELF
    //////////////////////////////////////////////////

    const dist = Math.sqrt(

        x*x +
        y*y

    );

    if(dist < 250){

        height += 4;

    }

    //////////////////////////////////////////////////
    // GENTLE SEABED UNDULATION
    //////////////////////////////////////////////////

    height +=

    Math.sin(
        x * 0.008
    ) * 2;

    height +=

    Math.cos(
        y * 0.008
    ) * 2;

    //////////////////////////////////////////////////
    // REEF CHANNELS
    //////////////////////////////////////////////////

    height -=

    Math.sin(
        x * 0.015
    ) * 1.5;

    height -=

    Math.cos(
        y * 0.012
    ) * 1.0;

    //////////////////////////////////////////////////
    // MICRO VARIATION
    //////////////////////////////////////////////////

    height +=

    Math.sin(
        x * 0.05 +
        y * 0.04
    ) * 0.5;

    //////////////////////////////////////////////////
    // REEF PLATEAUS
    //////////////////////////////////////////////////

    const plateau1 =

    Math.sqrt(

        (x+150)*(x+150) +
        (y-50)*(y-50)

    );

    if(plateau1 < 120){

        height += 2;

    }

    const plateau2 =

    Math.sqrt(

        (x-180)*(x-180) +
        (y+120)*(y+120)

    );

    if(plateau2 < 100){

        height += 2;

    }

    //////////////////////////////////////////////////
    // FINAL HEIGHT
    //////////////////////////////////////////////////

    pos.setZ(
        i,
        height
    );

}

floorGeometry.computeVertexNormals();

const floor =

new THREE.Mesh(

    floorGeometry,

    new THREE.MeshStandardMaterial({

        color:0x8f7c5c,

        roughness:1,

        metalness:0

    })

);

floor.rotation.x =
-Math.PI/2;

floor.position.y =
-8;

floor.receiveShadow =
false;

scene.add(
    floor
);
/////////////////////////////////////////////////
// PARTICLES
/////////////////////////////////////////////////

const particleGeo = new THREE.BufferGeometry();
const points = [];
for (let i = 0; i < 12000; i++) {
  points.push(
    (Math.random() - 0.5) * 500,
    Math.random() * 80 - 10,
    (Math.random() - 0.5) * 500
  );
}
particleGeo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
const particles = new THREE.Points(
  particleGeo,
  new THREE.PointsMaterial({ size: 0.05, color: 0xdff7ff })
);
scene.add(particles);

/////////////////////////////////////////////////
// LIGHT SHAFTS
/////////////////////////////////////////////////

for (let i = 0; i < 20; i++) {
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 6, 40, 8, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.04,
      depthWrite: false,
    })
  );
  shaft.position.set(
    (Math.random() - 0.5) * 120,
    10,
    (Math.random() - 0.5) * 120
  );
  scene.add(shaft);
}

/////////////////////////////////////////////////
// PROCEDURAL FISH MODELS
/////////////////////////////////////////////////

function createSmallFish(color) {
  const group = new THREE.Group();

  // Body – slightly elongated sphere
  const bodyGeo = new THREE.SphereGeometry(0.4, 8, 8);
  const bodyMat = new THREE.MeshStandardMaterial({ color });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.scale.set(1.4, 0.8, 0.6);
  group.add(body);

  // Tail – flat cone
  const tailGeo = new THREE.ConeGeometry(0.3, 0.8, 6);
  const tailMat = new THREE.MeshStandardMaterial({ color });
  const tail = new THREE.Mesh(tailGeo, tailMat);
  tail.position.set(-0.65, 0, 0);
  tail.rotation.z = Math.PI / 2;
  tail.scale.set(1, 0.4, 1);
  group.add(tail);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.08, 4, 4);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(0.3, 0.15, 0.22);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.3, 0.15, -0.22);
  group.add(rightEye);

  return group;
}

function createBigFish(color) {
  const group = new THREE.Group();

  // Larger, deeper body
  const bodyGeo = new THREE.SphereGeometry(0.8, 12, 12);
  const bodyMat = new THREE.MeshStandardMaterial({ color });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.scale.set(1.6, 0.9, 0.7);
  group.add(body);

  // Tail
  const tailGeo = new THREE.ConeGeometry(0.6, 1.5, 8);
  const tailMat = new THREE.MeshStandardMaterial({ color });
  const tail = new THREE.Mesh(tailGeo, tailMat);
  tail.position.set(-1.2, 0, 0);
  tail.rotation.z = Math.PI / 2;
  tail.scale.set(1, 0.5, 1);
  group.add(tail);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.12, 6, 6);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(0.65, 0.2, 0.35);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.65, 0.2, -0.35);
  group.add(rightEye);

  return group;
}

/////////////////////////////////////////////////
// ASSETS (CORALS ONLY)
/////////////////////////////////////////////////

const loader = new GLTFLoader();
let branchingCoral, livingCoral, fossilCoral;

// We keep only the coral GLBs
Promise.all([
  loader.loadAsync("./seriatopora_hystrix.glb"),
  loader.loadAsync("./corals/living/scene_normal.gltf"),
  loader.loadAsync("./corals/fossil/scene_fossil.gltf"),
]).then((results) => {
  branchingCoral = results[0].scene;
  livingCoral = results[1].scene;
  fossilCoral = results[2].scene;

 /////////////////////////////////////////////////
// REEF NETWORK
/////////////////////////////////////////////////

const reefPositions = [

[-120,-120],
[-90,-80],
[-60,-40],
[-30,0],

[0,40],
[30,80],
[60,120],

[-100,60],
[-50,90],
[20,140],

[80,-60],
[120,-20]

];

const reefs = [];

reefPositions.forEach(p=>{

    reefs.push(

        reefCluster(

            p[0],
            p[1]

        )

    );

});

/////////////////////////////////////////////////
// ANCIENT FOSSIL REEF
/////////////////////////////////////////////////

const ancientReef =

reefCluster(
    0,
    -220,
    true
);

/////////////////////////////////////////////////
// FISH POPULATION (OPTIMIZED)
/////////////////////////////////////////////////

reefs.forEach(reef=>{

    spawnSchool(
        "reef",
        reef,
        15,
        0.15,
        8
    );

    spawnSchool(
        "gold",
        reef,
        8,
        0.10,
        5
    );

});

spawnSchool(
    "big",
    new THREE.Vector3(
        0,
        0,
        0
    ),
    3,
    0.45,
    40
);
});

/////////////////////////////////////////////////
// AUTO SCALE (for corals)
/////////////////////////////////////////////////

function autoScale(object, targetHeight) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  const scale = targetHeight / Math.max(size.y, 0.01);
  object.scale.setScalar(scale);
}

/////////////////////////////////////////////////
// REEF GENERATION V2
/////////////////////////////////////////////////

/////////////////////////////////////////////////
// REEF SHELF CLUSTER V3
/////////////////////////////////////////////////

function reefCluster(
    x,
    z,
    isAncient = false
){

    const reef =
    new THREE.Group();

    //////////////////////////////////////////////////
    // REEF HEIGHT
    //////////////////////////////////////////////////

    reef.position.set(
        x,
        -3,
        z
    );

    //////////////////////////////////////////////////
    // MAIN REEF CORE
    //////////////////////////////////////////////////

    const rock =
    new THREE.Mesh(

        new THREE.IcosahedronGeometry(
            6,
            2
        ),

        new THREE.MeshStandardMaterial({

            color:0x665544

        })

    );

    reef.add(rock);

    //////////////////////////////////////////////////
    // REEF RIDGE NETWORK
    //////////////////////////////////////////////////

    for(let n=0;n<12;n++){

        const ridgeRock =

        new THREE.Mesh(

            new THREE.IcosahedronGeometry(

                2 +
                Math.random()*4,

                1

            ),

            new THREE.MeshStandardMaterial({

                color:0x665544

            })

        );

        ridgeRock.position.set(

            (Math.random()-0.5)*50,

            Math.random()*3,

            (Math.random()-0.5)*50

        );

        ridgeRock.rotation.y =
        Math.random() *
        Math.PI * 2;

        reef.add(
            ridgeRock
        );

    }

    //////////////////////////////////////////////////
    // BRANCHING CORAL
    //////////////////////////////////////////////////

    for(let i=0;i<50;i++){

        const coral =
        branchingCoral.clone(true);

        coral.userData.isCoral = true;

        coral.userData.offset =
        Math.random()*100;

        autoScale(
            coral,
            2
        );

        coral.position.set(

            (Math.random()-0.5)*50,

            1 + Math.random()*4,

            (Math.random()-0.5)*50

        );

        coral.rotation.y =
        Math.random() *
        Math.PI * 2;

        reef.add(coral);

    }

    //////////////////////////////////////////////////
    // LIVING CORAL
    //////////////////////////////////////////////////

    for(let i=0;i<20;i++){

        const coral =
        livingCoral.clone(true);

        coral.userData.isCoral = true;

        coral.userData.offset =
        Math.random()*100;

        autoScale(
            coral,
            1.2
        );

        coral.position.set(

            (Math.random()-0.5)*50,

            1 + Math.random()*4,

            (Math.random()-0.5)*50

        );

        coral.rotation.y =
        Math.random() *
        Math.PI * 2;

        reef.add(coral);

    }

    //////////////////////////////////////////////////
    // FOSSIL CORAL
    //////////////////////////////////////////////////

    for(let i=0;i<8;i++){

        const coral =
        fossilCoral.clone(true);

        coral.userData.isCoral = true;

        coral.userData.offset =
        Math.random()*100;

        autoScale(

            coral,

            isAncient
            ? 3
            : 0.8

        );

        coral.position.set(

            (Math.random()-0.5)*55,

            Math.random()*2,

            (Math.random()-0.5)*55

        );

        coral.rotation.y =
        Math.random() *
        Math.PI * 2;

        reef.add(coral);

    }

    //////////////////////////////////////////////////
    // ADD TO SCENE
    //////////////////////////////////////////////////

    scene.add(
        reef
    );

    return reef.position.clone();

}
/////////////////////////////////////////////////
// ADVANCED SCHOOL SPAWNING
/////////////////////////////////////////////////

const animatedFish = [];

function spawnSchool(
    type,
    center,
    count,
    scale,
    radius
){

    for(let i=0;i<count;i++){

        let fish;

        if(type === "reef"){

            fish = createSmallFish(
                0x2288ff
            );

        }
        else if(type === "gold"){

            fish = createSmallFish(
                0xddbb00
            );

        }
        else{

            fish = createBigFish(
                0x4455aa
            );

        }

        fish.scale.setScalar(scale);

        fish.position.set(

            center.x +
            (Math.random()-0.5)*
            radius*4,

            -2 +
            Math.random()*5,

            center.z +
            (Math.random()-0.5)*
            radius*4

        );

        fish.userData = {

            center:
            center.clone(),

            preferredDepth:
            -3 +
            Math.random()*6,

            velocity:
            new THREE.Vector3(

                (Math.random()-0.5)*0.15,

                (Math.random()-0.5)*0.04,

                (Math.random()-0.5)*0.15

            ),

            acceleration:
            new THREE.Vector3(),

            maxSpeed:
            0.05 +
            Math.random()*0.05,

            phase:
            Math.random() *
            Math.PI * 2

        };

        scene.add(fish);

        animatedFish.push(fish);

    }

}
/////////////////////////////////////////////////
// ADVANCED ANIMATION
/////////////////////////////////////////////////

const clock =
new THREE.Clock();

function animate(){

    requestAnimationFrame(
        animate
    );

    const time =
    clock.getElapsedTime();

    animatedFish.forEach(fish=>{

        const separation =
        new THREE.Vector3();

        const alignment =
        new THREE.Vector3();

        const cohesion =
        new THREE.Vector3();

        let neighbours = 0;

        //////////////////////////////////////////////////
        // BOIDS
        //////////////////////////////////////////////////

        animatedFish.forEach(other=>{

            if(other === fish) return;

            const dist =
            fish.position.distanceTo(
                other.position
            );

            if(
                dist > 0 &&
                dist < 8
            ){

                const diff =
                fish.position
                .clone()
                .sub(
                    other.position
                );

                diff.divideScalar(
                    dist
                );

                separation.add(
                    diff
                );

                alignment.add(
                    other.userData.velocity
                );

                cohesion.add(
                    other.position
                );

                neighbours++;

            }

        });

        if(neighbours > 0){

            alignment.divideScalar(
                neighbours
            );

            cohesion.divideScalar(
                neighbours
            );

            cohesion.sub(
                fish.position
            );

            fish.userData.acceleration.add(

                separation.multiplyScalar(
                    0.002
                )

            );

            fish.userData.acceleration.add(

                alignment.multiplyScalar(
                    0.0003
                )

            );

            fish.userData.acceleration.add(

                cohesion.multiplyScalar(
                    0.00005
                )

            );

        }

        //////////////////////////////////////////////////
        // REEF FOLLOWING
        //////////////////////////////////////////////////

        const reefForce =
        fish.userData.center
        .clone()
        .sub(
            fish.position
        );

        reefForce.y *= 0.3;

        reefForce.normalize();

        reefForce.multiplyScalar(
            0.0005
        );

        fish.userData.acceleration.add(
            reefForce
        );

        //////////////////////////////////////////////////
        // DEPTH PREFERENCE
        //////////////////////////////////////////////////

        const depthForce =

        (
            fish.userData.preferredDepth -
            fish.position.y
        ) * 0.0005;

        fish.userData.acceleration.y +=
        depthForce;

        //////////////////////////////////////////////////
        // PREDATOR / PREY
        //////////////////////////////////////////////////

        if(
            fish.scale.x > 0.3
        ){

            animatedFish.forEach(other=>{

                if(
                    other !== fish &&
                    other.scale.x < 0.2
                ){

                    const dist =
                    fish.position.distanceTo(
                        other.position
                    );

                    if(dist < 15){

                        const chase =
                        other.position
                        .clone()
                        .sub(
                            fish.position
                        );

                        chase.normalize();

                        chase.multiplyScalar(
                            0.001
                        );

                        fish.userData.acceleration
                        .add(chase);

                    }

                }

            });

        }
        else{

            animatedFish.forEach(other=>{

                if(
                    other.scale.x > 0.3
                ){

                    const dist =
                    fish.position.distanceTo(
                        other.position
                    );

                    if(dist < 10){

                        const flee =
                        fish.position
                        .clone()
                        .sub(
                            other.position
                        );

                        flee.normalize();

                        flee.multiplyScalar(
                            0.003
                        );

                        fish.userData.acceleration
                        .add(flee);

                    }

                }

            });

        }

        //////////////////////////////////////////////////
        // PHYSICS
        //////////////////////////////////////////////////

        fish.userData.velocity.add(
            fish.userData.acceleration
        );

        if(
            fish.userData.velocity.length() >
            fish.userData.maxSpeed
        ){

            fish.userData.velocity
            .normalize()
            .multiplyScalar(
                fish.userData.maxSpeed
            );

        }

        fish.position.add(
            fish.userData.velocity
        );

        fish.userData.acceleration.set(
            0,
            0,
            0
        );

        //////////////////////////////////////////////////
        // LOOK DIRECTION
        //////////////////////////////////////////////////

        fish.lookAt(

            fish.position.x +
            fish.userData.velocity.x,

            fish.position.y +
            fish.userData.velocity.y,

            fish.position.z +
            fish.userData.velocity.z

        );

        //////////////////////////////////////////////////
        // BANKING
        //////////////////////////////////////////////////

        const bank =

        THREE.MathUtils.clamp(

            fish.userData.velocity.x,

            -0.08,

            0.08

        );

        fish.rotation.z =
        -bank * 4;

        //////////////////////////////////////////////////
        // TAIL ANIMATION
        //////////////////////////////////////////////////

        const tail =
        fish.children[1];

        if(tail){

            tail.rotation.y =

            Math.sin(

                time * 12 +

                fish.userData.phase

            ) * 0.6;

        }

    });

    controls.update();

    renderer.render(
        scene,
        camera
    );

}

animate();