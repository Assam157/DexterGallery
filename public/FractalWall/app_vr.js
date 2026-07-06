 import * as THREE from 'three';

import { VRButton }
from 'three/addons/webxr/VRButton.js';

import { GravityFrame }
from './src/player/GravityFrame.js';

import { TunnelGraph }
from './src/world/TunnelGraph.js';

import { PortalManager }
from './src/portals/PortalManager.js';

import { PlayerHistory }
from './src/portals/PlayerHistory.js';

import { RenderPipeline }
from './src/rendering/RenderPipeline.js';

import {
    createFractalStoneMaterial
}
from './src/shaders/fractalStone.js';

import {
    createRecursiveFogMaterial
}
from './src/shaders/recursiveFog.js';


// ----------------------------------------------------
// Renderer
// ----------------------------------------------------

const renderer =
    new THREE.WebGLRenderer({
        antialias:true
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

renderer.xr.enabled = true;

document.body.appendChild(
    renderer.domElement
);

document.body.appendChild(
    VRButton.createButton(
        renderer
    )
);


// ----------------------------------------------------
// Scene
// ----------------------------------------------------

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(
        0x000000
    );

scene.fog =
    new THREE.FogExp2(
        0x000000,
        0.025
    );


// ----------------------------------------------------
// Camera
// ----------------------------------------------------

const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth /
        window.innerHeight,
        0.1,
        5000
    );


// ----------------------------------------------------
// XR Rig
// ----------------------------------------------------

const rig =
    new THREE.Group();

rig.add(
    camera
);

scene.add(
    rig
);

rig.position.set(
    0,
    0,
    10
);


// ----------------------------------------------------
// Lighting
// ----------------------------------------------------

const ambient =
    new THREE.AmbientLight(
        0xffffff,
        0.35
    );

scene.add(
    ambient
);

const lamp =
    new THREE.PointLight(
        0xffffff,
        6,
        40
    );

camera.add(
    lamp
);


// ----------------------------------------------------
// Materials
// ----------------------------------------------------

const stoneMaterial =
    createFractalStoneMaterial();

const fogMaterial =
    createRecursiveFogMaterial();


// ----------------------------------------------------
// World
// ----------------------------------------------------

const graph =
    new TunnelGraph(
        scene,
        stoneMaterial
    );


// ----------------------------------------------------
// Systems
// ----------------------------------------------------

const gravityFrame =
    new GravityFrame();

const portalManager =
    new PortalManager(
        renderer
    );

const history =
    new PlayerHistory(
        3000
    );

const pipeline =
    new RenderPipeline(
        renderer,
        scene,
        camera
    );


// ----------------------------------------------------
// Desktop Controls
// ----------------------------------------------------

const keys = {};

let yaw = 0;
let pitch = 0;

let pointerLocked = false;

window.addEventListener(
    'keydown',
    e =>
    {
        keys[e.code] = true;
    }
);

window.addEventListener(
    'keyup',
    e =>
    {
        keys[e.code] = false;
    }
);

renderer.domElement.addEventListener(
    'click',
    () =>
    {
        renderer.domElement
            .requestPointerLock();
    }
);

document.addEventListener(
    'pointerlockchange',
    () =>
    {
        pointerLocked =
            document.pointerLockElement ===
            renderer.domElement;
    }
);

document.addEventListener(
    'mousemove',
    e =>
    {
        if(
            !pointerLocked ||
            renderer.xr.isPresenting
        )
        {
            return;
        }

        yaw -=
            e.movementX *
            0.002;

        pitch -=
            e.movementY *
            0.002;

        pitch =
            Math.max(
                -Math.PI/2,
                Math.min(
                    Math.PI/2,
                    pitch
                )
            );
    }
);


// ----------------------------------------------------
// Desktop Movement
// ----------------------------------------------------

function updateDesktopMovement(delta)
{
    const dir =
        new THREE.Vector3();

    if(keys.KeyW)
        dir.z -= 1;

    if(keys.KeyS)
        dir.z += 1;

    if(keys.KeyA)
        dir.x -= 1;

    if(keys.KeyD)
        dir.x += 1;

    if(
        dir.lengthSq() === 0
    )
    {
        return;
    }

    dir.normalize();

    dir.applyAxisAngle(
        new THREE.Vector3(
            0,
            1,
            0
        ),
        yaw
    );

    const nextPos =
    rig.position.clone();

nextPos.addScaledVector(
    dir,
    delta * 5
);

if(
    constrainTunnel(
        nextPos
    )
)
{
    rig.position.copy(
        nextPos
    );
}
}


// ----------------------------------------------------
// VR Controllers
// ----------------------------------------------------

scene.add(
    renderer.xr.getController(0)
);

scene.add(
    renderer.xr.getController(1)
);


// ----------------------------------------------------
// VR Movement
// ----------------------------------------------------
function getPlayerWorldPosition()
{
    const pos =
        new THREE.Vector3();

    camera.getWorldPosition(
        pos
    );

    return pos;
}

function constrainTunnel(position)
{
    const tunnelRadius = 2.2;

    const radial =
        Math.sqrt(
            position.x * position.x +
            position.y * position.y
        );

    return radial <
        tunnelRadius;
}
function updateVRMovement(delta)
{
    const session =
        renderer.xr.getSession();

    if(!session)
        return;

    // -------------------
    // Recenter headset
    // -------------------

    const headsetOffset =
        camera.position.clone();

    headsetOffset.y = 0;

    if(
        headsetOffset.length() >
        0.4
    )
    {
        rig.position.add(
            headsetOffset
        );

        camera.position.sub(
            headsetOffset
        );
    }

    // -------------------
    // Controller movement
    // -------------------

    for(
        const source
        of session.inputSources
    )
    {
        if(
            !source.gamepad
        )
        {
            continue;
        }

        const axes =
            source.gamepad.axes;

        if(
            axes.length < 2
        )
        {
            continue;
        }

        const x =
            axes[2] ??
            axes[0];

        const y =
            axes[3] ??
            axes[1];

        const dir =
            new THREE.Vector3(
                x,
                0,
                y
            );

        if(
            dir.lengthSq() <
            0.01
        )
        {
            continue;
        }

        dir.normalize();

        dir.applyQuaternion(
            camera.quaternion
        );

        dir.y = 0;

        const nextPos =
            rig.position.clone();

        nextPos.addScaledVector(
            dir,
            delta * 4
        );

        if(
            constrainTunnel(
                nextPos
            )
        )
        {
            rig.position.copy(
                nextPos
            );
        }
    }
}


// ----------------------------------------------------
// Resize
// ----------------------------------------------------

window.addEventListener(
    'resize',
    () =>
    {
        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        if(
            pipeline.composer &&
            pipeline.composer.resize
        )
        {
            pipeline.composer.resize(
                window.innerWidth,
                window.innerHeight
            );
        }
    }
);


// ----------------------------------------------------
// Animation
// ----------------------------------------------------

const clock =
    new THREE.Clock();

renderer.setAnimationLoop(
    () =>
    {
        const delta =
            clock.getDelta();

        const elapsed =
            clock.elapsedTime;

        if(
            renderer.xr.isPresenting
        )
        {
            updateVRMovement(
                delta
            );
        }
        else
        {
            updateDesktopMovement(
                delta
            );

            rig.rotation.y =
                yaw;

            camera.rotation.x =
                pitch;
        }

        gravityFrame.update(
            delta
        );

        graph.update(
            rig
        );

        history.record(
            rig
        );

        portalManager.render(
            scene
        );

        stoneMaterial.uniforms.time.value =
            elapsed;

        fogMaterial.uniforms.time.value =
            elapsed;

        if(
            renderer.xr.isPresenting
        )
        {
            renderer.render(
                scene,
                camera
            );
        }
        else
        {
            pipeline.render(
                elapsed,
                0
            );
        }
    }
);