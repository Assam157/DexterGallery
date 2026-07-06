/***********************************************************************
 *
 * app.js
 *
 * Milkomeda V2
 *
 * Part 1A
 *
 ***********************************************************************/

import * as THREE from "three";

import { Galaxy } from "./Galaxy.js";
import { GalaxyOrbit } from "./GalaxyOrbit.js";
import { GalaxyPhysics } from "./GalaxyPhysics.js";

import { GasSimulation } from "./GasSimulation.js";
import { BridgeRenderer } from "./BridgeRenderer.js";
import { StarburstSimulation } from "./StarburstSimulation.js";

import { CameraRig } from "./CameraRig.js";

/********************************************************
                    SCENE
********************************************************/

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x000000);

/********************************************************
                    CAMERA
********************************************************/

const camera = new THREE.PerspectiveCamera(

    60,

    window.innerWidth /
    window.innerHeight,

    0.1,

    10000

);

camera.position.set(

    0,

    180,

    900

);

/********************************************************
                    RENDERER
********************************************************/

const renderer =

    new THREE.WebGLRenderer({

        antialias:true

    });

renderer.setPixelRatio(

    window.devicePixelRatio

);

renderer.setSize(

    window.innerWidth,

    window.innerHeight

);

renderer.outputColorSpace =

    THREE.SRGBColorSpace;

document.body.appendChild(

    renderer.domElement

);

/********************************************************
                    LIGHTING
********************************************************/

const ambient =

    new THREE.AmbientLight(

        0xffffff,

        1.15

    );

scene.add(

    ambient

);

const flash =

    new THREE.PointLight(

        0xffffff,

        0,

        3500

    );

flash.position.set(

    0,

    0,

    0

);

scene.add(

    flash

);

/********************************************************
                    CLOCK
********************************************************/

const clock =

    new THREE.Clock();

/********************************************************
                    TIMELINE
********************************************************/

let timeline = 0;

let playbackSpeed = 0.03;

let autoplay = false;

/********************************************************
                    INPUT
********************************************************/

const keys = {};

window.addEventListener(

    "keydown",

    e=>{
    

        keys[e.code]=true;

    }

);

window.addEventListener(

    "keyup",

    e=>{

        keys[e.code]=false;

    }

);

/********************************************************
                    UI
********************************************************/

const slider =

document.getElementById(

    "time"

);

const label =

document.getElementById(

    "label"

);

const eventLabel =

document.getElementById(

    "event"

);
/********************************************************
                    GALAXIES
********************************************************/

const milkyWay =

    new Galaxy({

        radius:170,

        haloRadius:360,

        coreRadius:28,

        starCount:90000,

        armCount:4,

        armSpread:0.55,

        diskThickness:5,

        rotationSpeed:0.00045,

        color:0x88bbff

    });

milkyWay.setRotation(

    1.0,

    0,

    0

);

milkyWay.setPosition(

    0,

    0,

    -900

);

scene.add(

    milkyWay.object

);

/********************************************************/

const andromeda =

    new Galaxy({

        radius:175,

        haloRadius:370,

        coreRadius:30,

        starCount:90000,

        armCount:5,

        armSpread:0.60,

        diskThickness:5,

        rotationSpeed:-0.00040,

        color:0xffd39a

    });

andromeda.setRotation(

    -0.75,

    0,

    0

);

andromeda.setPosition(

    0,

    0,

    900

);

scene.add(

    andromeda.object

);

/********************************************************
                    ORBIT
********************************************************/

const orbit =

    new GalaxyOrbit(

        milkyWay,

        andromeda

    );

/********************************************************
                    PHYSICS
********************************************************/

const physics =

    new GalaxyPhysics(

        milkyWay,

        andromeda

    );

/********************************************************
                    GAS
********************************************************/

const gas =

    new GasSimulation({

        particles:35000,

        radius:520

    });

scene.add(

    gas.object

);

/********************************************************
                    BRIDGE
********************************************************/

const bridge =

    new BridgeRenderer({

        particles:22000

    });

scene.add(

    bridge.object

);

/********************************************************
                    STARBURSTS
********************************************************/

const starburst =

    new StarburstSimulation({

        regions:1200,

        radius:520

    });

scene.add(

    starburst.object

);

/********************************************************
                    CAMERA RIG
********************************************************/

const cameraRig =

    new CameraRig(

        camera

    );

/********************************************************
                    TEMPORARIES
********************************************************/

const midpoint =

    new THREE.Vector3();

const state = {

    zoom:1,

    progress:0,

    merger:0,

    flash:0

};
/********************************************************
                    TIMELINE
********************************************************/

function updateTimeline(delta){

    //----------------------------------------
    // Auto playback
    //----------------------------------------

    if(autoplay){

        timeline +=

            delta *

            playbackSpeed;

    }

    //----------------------------------------

    timeline =

        THREE.MathUtils.clamp(

            timeline,

            0,

            1

        );

    //----------------------------------------

    if(slider){

        slider.value =

            timeline * 7.0;

    }

    //----------------------------------------

    if(label){

        label.textContent =

            (timeline * 7.0)

            .toFixed(2)

            +

            " Billion Years";

    }

    //----------------------------------------

    if(eventLabel){

        if(timeline < 0.15)

            eventLabel.textContent =

                "Present Day";

        else if(timeline < 0.35)

            eventLabel.textContent =

                "Approach";

        else if(timeline < 0.55)

            eventLabel.textContent =

                "First Passage";

        else if(timeline < 0.72)

            eventLabel.textContent =

                "Bridge Formation";

        else if(timeline < 0.90)

            eventLabel.textContent =

                "Final Merger";

        else

            eventLabel.textContent =

                "Milkomeda";

    }

}

/********************************************************
                    SLIDER
********************************************************/

if(slider){

    slider.addEventListener(

        "input",

        e=>{

            timeline =

                parseFloat(

                    e.target.value

                ) / 7.0;

        }

    );

}

/********************************************************
                    KEYBOARD
********************************************************/

function handleKeyboard(delta){

    //----------------------------------------

    if(keys["KeyP"]){

        autoplay = !autoplay;

        keys["KeyP"] = false;

    }

    //----------------------------------------

    if(keys["KeyR"]){

        autoplay = false;

        timeline = 0;

        keys["KeyR"] = false;

    }

    //----------------------------------------

    if(keys["KeyD"]){
         console.log("Moving Forward");

        timeline +=

            delta * 0.30;

    }

    //----------------------------------------

    if(keys["KeyA"]){
         console.log("Moving Backward");

        timeline -=

            delta * 0.30;

    }

    //----------------------------------------

    timeline =

        THREE.MathUtils.clamp(

            timeline,

            0,

            1

        );

}

/********************************************************
                    WINDOW RESIZE
********************************************************/

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
/***********************************************************************
 *
 * app.js
 *
 * Part 2
 *
 ***********************************************************************/

/********************************************************
                    ANIMATION
********************************************************/

function animate(){

    requestAnimationFrame(

        animate

    );

    //--------------------------------------------------

    const delta =

        clock.getDelta();

    //--------------------------------------------------

    handleKeyboard(

        delta

    );

    //--------------------------------------------------

    updateTimeline(

        delta

    );

    //--------------------------------------------------
    // Orbit Controller
    //--------------------------------------------------

    orbit.setProgress(

        timeline

    );

    orbit.update();

    //--------------------------------------------------
    // Physics
    //--------------------------------------------------

    physics.update(

        delta

    );

    //--------------------------------------------------
    // Merger Strength
    //--------------------------------------------------

    const merger =

        physics.strength;

    state.progress = timeline;
    state.zoom = 1.0 - merger*0.18;
    state.merger = merger;

    //--------------------------------------------------
    // Midpoint
    //--------------------------------------------------

    midpoint.copy(

        milkyWay.object.position

    );

    midpoint.lerp(

        andromeda.object.position,

        0.5

    );

    //--------------------------------------------------
    // Gas
    //--------------------------------------------------

    gas.update(

        delta,

        physics.gravity,

        milkyWay,

        andromeda

    );

    //--------------------------------------------------
    // Bridge
    //--------------------------------------------------

    bridge.update(

        milkyWay,

        andromeda,

        gas,

        merger

    );

    //--------------------------------------------------
    // Starburst
    //--------------------------------------------------

    starburst.update(

        delta,

        gas,

        merger

    );

    //--------------------------------------------------
    // Galaxies
    //--------------------------------------------------

    milkyWay.update(

        delta,

        camera

    );

    andromeda.update(

        delta,

        camera

    );

    //--------------------------------------------------
    // Collision Flash
    //--------------------------------------------------

    if(

        merger > 0.65

    ){

        flash.position.copy(

            midpoint

        );

        flash.intensity =

            30 *

            (merger-0.65)/0.35;

    }

    else{

        flash.intensity = 0;

    }

    //--------------------------------------------------
    // Camera
    //--------------------------------------------------

    cameraRig.update(

        delta,

        state

    );

    //--------------------------------------------------

    renderer.render(

        scene,

        camera

    );

}

/********************************************************
                    START
********************************************************/

updateTimeline(

    0

);

animate();