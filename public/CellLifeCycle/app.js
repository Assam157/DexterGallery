
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/////////////////////////////////////////////////
// SCENE
/////////////////////////////////////////////////

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x24113d);

scene.fog = new THREE.FogExp2(
    0x24113d,
    0.0015
);

/////////////////////////////////////////////////
// CAMERA
/////////////////////////////////////////////////

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
);

camera.position.set(
    0,
    50,
    150
);

/////////////////////////////////////////////////
// RENDERER
/////////////////////////////////////////////////

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        1.5
    )
);

renderer.outputColorSpace =
THREE.SRGBColorSpace;

document.body.appendChild(
    renderer.domElement
);

/////////////////////////////////////////////////
// CONTROLS
/////////////////////////////////////////////////

const controls =
new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;

/////////////////////////////////////////////////
// LIGHTING
/////////////////////////////////////////////////

scene.add(
    new THREE.AmbientLight(
        0xffffff,
        3
    )
);

const hemi =
new THREE.HemisphereLight(
    0xffffff,
    0x444444,
    2
);

scene.add(hemi);

const sun =
new THREE.DirectionalLight(
    0xffffff,
    2
);

sun.position.set(
    50,
    80,
    50
);

scene.add(sun);

/////////////////////////////////////////////////
// PARTICLES
/////////////////////////////////////////////////

const particleGeo =
new THREE.BufferGeometry();

const particlePositions = [];

for(let i=0;i<2500;i++){

    particlePositions.push(
        (Math.random()-0.5)*800,
        (Math.random()-0.5)*800,
        (Math.random()-0.5)*800
    );

}

particleGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
        particlePositions,
        3
    )
);

const particles =
new THREE.Points(

    particleGeo,

    new THREE.PointsMaterial({

        color:0xff99cc,
        size:1,
        transparent:true,
        opacity:0.5

    })

);

scene.add(
    particles
);

/////////////////////////////////////////////////
// MODEL
/////////////////////////////////////////////////

const loader =
new GLTFLoader();

let cellModel = null;

loader.load(

    "./assets/cell/animal_cell_new.glb",

    (gltf)=>{

        console.log(
            "CELL LOADED"
        );

        cellModel =
        gltf.scene;

        cellModel.scale.setScalar(
            10
        );

        scene.add(
            cellModel
        );

        let meshCount = 0;

        console.log(
            "===== HIERARCHY ====="
        );

        cellModel.traverse(obj=>{

            console.log(
                obj.type,
                obj.name
            );

            if(obj.isMesh){

                meshCount++;

                console.log(
                    "MESH:",
                    obj.name
                );

                console.log(
                    "MATERIAL:",
                    obj.material
                );

                if(obj.material){

                    console.log(
                        "COLOR:",
                        obj.material.color
                    );

                }

            }

        });

        console.log(
            "TOTAL MESHES:",
            meshCount
        );

    },

    undefined,

    (error)=>{

        console.error(
            "LOAD ERROR:",
            error
        );

    }

);
/////////////////////////////////////////////////
// ORGANELLE DATABASE
/////////////////////////////////////////////////

const organelleInfo = {

    CellNucleus:
    "The nucleus is the control center of the cell. It stores DNA and regulates all cellular activities.",

    Mitochondria:
    "Mitochondria generate ATP, the primary energy source used by the cell.",

    GolgiBody:
    "The Golgi Body modifies, sorts and packages proteins and lipids for transport throughout the cell.",

    RoughEndoplasmicReticulum:
    "The Rough Endoplasmic Reticulum synthesizes proteins and transports them through the cell. Ribosomes attached to its surface give it a rough appearance.",

    Rough_EndoplasmicReticulum:
    "The Rough Endoplasmic Reticulum synthesizes proteins and transports them through the cell. Ribosomes attached to its surface give it a rough appearance.",

    Rough_Endoplasmic_Reticulum:
    "The Rough Endoplasmic Reticulum synthesizes proteins and transports them through the cell. Ribosomes attached to its surface give it a rough appearance.",

    Plasmodesmata:
    "Plasmodesmata are microscopic channels connecting neighboring plant cells, allowing communication and transport of materials.",

    Chloroplast:
    "Chloroplasts perform photosynthesis, converting sunlight into chemical energy for the plant cell.",

    InnerCellBodyAndTissue:
    "This region contains the cytoplasm and internal structures that support the cell's life processes.",

    OuterCellBodyAndTissue:
    "The outer cell body provides structure, protection and separation from the surrounding environment.",

    Vacuole:
    "The vacuole stores water, nutrients and waste products while helping maintain cell pressure.",

    Microfilament:
    "Microfilaments are part of the cytoskeleton and help maintain cell shape, movement and structural support."

};
/////////////////////////////////////////////////
// NAME CLEANER
/////////////////////////////////////////////////

function cleanOrganelleName(name){

    return name

    .replace(/\d+$/,"")

    .replace(/[._-]+$/,"")

    .trim();

}
/////////////////////////////////////////////////
// RAYCASTER
/////////////////////////////////////////////////

const raycaster =
new THREE.Raycaster();

const mouse =
new THREE.Vector2();

window.addEventListener(

    "click",

    (event)=>{

        if(!cellModel){
            return;
        }

        mouse.x =
        (
            event.clientX /
            window.innerWidth
        ) * 2 - 1;

        mouse.y =
        -(
            event.clientY /
            window.innerHeight
        ) * 2 + 1;

        raycaster.setFromCamera(
            mouse,
            camera
        );

        const hits =
        raycaster.intersectObject(
            cellModel,
            true
        );

        if(hits.length > 0){

            const obj =
            hits[0].object;

            const cleanName =
            cleanOrganelleName(
                obj.name
            );

            console.log(
                "RAW NAME:",
                obj.name
            );

            console.log(
                "CLEAN NAME:",
                cleanName
            );

            const info =
            organelleInfo[
                cleanName
            ] ||
            "No educational information available yet.";

            const scanner =
            document.getElementById(
                "scanner"
            );

            if(scanner){

                scanner.innerHTML =

                `
                <h3>${cleanName}</h3>
                <p>${info}</p>
                `;

            }

        }

    }

);
/////////////////////////////////////////////////
// ANIMATION
/////////////////////////////////////////////////

function animate(){

    requestAnimationFrame(
        animate
    );

    particles.rotation.y +=
    0.0002;

    controls.update();

    renderer.render(
        scene,
        camera
    );

}

animate();

/////////////////////////////////////////////////
// RESIZE
/////////////////////////////////////////////////

window.addEventListener(

    "resize",

    ()=>{

        camera.aspect =
        window.innerWidth /
        window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }

);
 
