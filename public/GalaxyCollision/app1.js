 /***********************************************************************
 *
 * app.js
 *
 * Milkomeda V2
 *
 * Prototype
 *
 * Part 1
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
import { GalaxyRenderer } from "./GalaxyRenderer.js";

/********************************************************
                    SCENE
********************************************************/

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x000000);

/********************************************************
                    CAMERA
********************************************************/

const camera =

new THREE.PerspectiveCamera(

60,

window.innerWidth/window.innerHeight,

0.1,

12000

);

camera.position.set(

0,

220,

1100

);

/********************************************************
                    RENDERER
********************************************************/

const renderer =

new THREE.WebGLRenderer({

antialias:true,

powerPreference:"high-performance"

});

renderer.setPixelRatio(

window.devicePixelRatio

);

renderer.setSize(

window.innerWidth,

window.innerHeight

);

renderer.outputEncoding =

THREE.sRGBEncoding;

renderer.autoClear = true;

document.body.appendChild(

renderer.domElement

);

/********************************************************
                    LIGHTING
********************************************************/

scene.add(

new THREE.AmbientLight(

0xffffff,

0.85

)

);

const sun =

new THREE.PointLight(

0xffffff,

1.8,

12000

);

sun.position.set(

0,

0,

0

);

scene.add(

sun);

/********************************************************
                    CLOCK
********************************************************/

const clock =

new THREE.Clock();

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

rotationSpeed:0.00045,

color:0x88bbff

});

scene.add(

milkyWay.object

);

const andromeda =

new Galaxy({

radius:180,

haloRadius:390,

coreRadius:32,

starCount:90000,

armCount:5,

armSpread:0.50,

rotationSpeed:-0.00038,

color:0xffd2aa

});

scene.add(

andromeda.object

);

/********************************************************
                    INITIAL POSITIONS
********************************************************/

milkyWay.object.position.set(

0,

0,

-950

);

andromeda.object.position.set(

0,

0,

950

);

milkyWay.object.rotation.x =

1.05;

andromeda.object.rotation.x =

-0.72;

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

count:35000,

radius:520

});

scene.add(

gas.object

);

/********************************************************
                    BRIDGE
********************************************************/

const bridge =

new BridgeRenderer();

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
                    TIMELINE
********************************************************/

let timeline = 0;

let autoplay = true;

let playbackSpeed = 0.08;

/********************************************************
                    INPUT
********************************************************/

const keys={};

window.addEventListener(

"keydown",

e=>{

keys[e.code]=true;

});

window.addEventListener(

"keyup",

e=>{

keys[e.code]=false;

});

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
                    END PART 1
********************************************************/
/***********************************************************************
 *
 * app.js
 *
 * Prototype
 *
 * Part 2
 *
 ***********************************************************************/

/********************************************************
                    TIMELINE
********************************************************/

function updateTimeline(){

    if(autoplay){

        timeline +=

            clock.getDelta()

            *playbackSpeed;

    }

    //------------------------------------------------

    timeline =

        THREE.MathUtils.clamp(

            timeline,

            0,

            1

        );

    //------------------------------------------------

    if(slider){

        slider.value =

            timeline*7;

    }

    //------------------------------------------------

    if(label){

        label.textContent =

            (timeline*7).toFixed(2)

            +" Billion Years";

    }

    //------------------------------------------------

    if(eventLabel){

        if(timeline<0.15)

            eventLabel.textContent="Present Day";

        else if(timeline<0.35)

            eventLabel.textContent="Approach";

        else if(timeline<0.55)

            eventLabel.textContent="First Passage";

        else if(timeline<0.72)

            eventLabel.textContent="Bridge Formation";

        else if(timeline<0.90)

            eventLabel.textContent="Starburst";

        else

            eventLabel.textContent="Milkomeda";

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

                )/7;

        }

    );

}

/********************************************************
                    KEYBOARD
********************************************************/

function handleKeyboard(delta){

    if(keys["Space"]){

        autoplay=false;

    }

    if(keys["KeyP"]){

        autoplay=!autoplay;

        keys["KeyP"]=false;

    }

    //--------------------------------------------

    if(keys["ArrowRight"]){

        timeline+=delta*0.30;

    }

    if(keys["ArrowLeft"]){

        timeline-=delta*0.30;

    }

    //--------------------------------------------

    if(keys["KeyR"]){

        timeline=0;

        autoplay=false;

        keys["KeyR"]=false;

    }

}

/********************************************************
                    RESIZE
********************************************************/

window.addEventListener(

    "resize",

    ()=>{

        camera.aspect=

            window.innerWidth/

            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(

            window.innerWidth,

            window.innerHeight

        );

    }

);

/********************************************************
                    ANIMATION
********************************************************/

function animate(){

    requestAnimationFrame(

        animate

    );

    //--------------------------------------------

    const delta=

        clock.getDelta();

    //--------------------------------------------

    handleKeyboard(

        delta

    );

    //--------------------------------------------

    updateTimeline();

    //--------------------------------------------
    // Orbit
    //--------------------------------------------

    orbit.update(

        delta,

        timeline

    );

    //--------------------------------------------
    // Physics
    //--------------------------------------------

    physics.update(

        delta

    );

    //--------------------------------------------
    // Gas
    //--------------------------------------------

    gas.update(

        delta,

        physics.gravity,

        milkyWay,

        andromeda

    );

    //--------------------------------------------
    // Bridge
    //--------------------------------------------

    bridge.update(

        milkyWay,

        andromeda,

        gas,

        physics.strength

    );

    //--------------------------------------------
    // Starbursts
    //--------------------------------------------

    starburst.update(

        delta,

        gas,

        physics.strength

    );

    //--------------------------------------------
    // Galaxy Updates
    //--------------------------------------------

    milkyWay.update(

        delta

    );

    andromeda.update(

        delta

    );

    //--------------------------------------------
    // Camera
    //--------------------------------------------

     cameraRig.timeline=

timeline;

cameraRig.update(

delta

);

    //--------------------------------------------

    renderer.render(

        scene,

        camera

    );

}

/********************************************************
                    START
********************************************************/

updateTimeline();

animate();