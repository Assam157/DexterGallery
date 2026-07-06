 import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';

import { CrawlController } from './src/player/CrawlController.js';
import { GravityFrame } from './src/player/GravityFrame.js';

import { TunnelGraph } from './src/world/TunnelGraph.js';

import { PortalManager } from './src/portals/PortalManager.js';
import { PlayerHistory } from './src/portals/PlayerHistory.js';

import { RenderPipeline } from './src/rendering/RenderPipeline.js';

import { createFractalStoneMaterial } from './src/shaders/fractalStone.js';
import { createRecursiveFogMaterial } from './src/shaders/recursiveFog.js';



// ====================================================
// Renderer
// ====================================================

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
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

renderer.shadowMap.enabled = true;

document.body.appendChild(
    renderer.domElement
);



// ====================================================
// Scene
// ====================================================

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x000000);

scene.fog =
    new THREE.FogExp2(
        0x000000,
        0.025
    );



// ====================================================
// Camera
// ====================================================

const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth /
        window.innerHeight,
        0.1,
        5000
    );



// ====================================================
// Clock
// ====================================================

const clock =
    new THREE.Clock();



// ====================================================
// Player Controller
// ====================================================

const controller =
    new CrawlController(
        camera,
        renderer.domElement
    );

scene.add(
    controller.getObject()
);



// ====================================================
// Gravity
// ====================================================

const gravityFrame =
    new GravityFrame();



// ====================================================
// Materials
// ====================================================

const stoneMaterial =
    createFractalStoneMaterial();

const fogMaterial =
    createRecursiveFogMaterial();



// ====================================================
// Lighting
// ====================================================

const ambient =
    new THREE.AmbientLight(
        0xffffff,
        0.25
    );

scene.add(
    ambient
);

const crawlLamp =
    new THREE.PointLight(
        0xffffff,
        4,
        20
    );

camera.add(
    crawlLamp
);



// ====================================================
// World
// ====================================================

const graph =
    new TunnelGraph(
        scene,
        stoneMaterial
    );



// ====================================================
// Portals
// ====================================================

const portalManager =
    new PortalManager(
        renderer
    );



// ====================================================
// Player History
// ====================================================

const history =
    new PlayerHistory(
        3000
    );



// ====================================================
// Render Pipeline
// ====================================================

const pipeline =
    new RenderPipeline(
        renderer,
        scene,
        camera
    );



// ====================================================
// State
// ====================================================

let madness = 0;
let depth = 0;



// ====================================================
// Helpers
// ====================================================

function updateMadness()
{
    if(!controller.getPosition)
        return;

    depth =
        Math.abs(
            controller
                .getPosition()
                .z
        );

    madness =
        Math.min(
            depth / 1000,
            1
        );
}



function updateGravityZones()
{
    if(!controller.getPosition)
        return;

    const z =
        controller
            .getPosition()
            .z;

    if(z < -250)
    {
        gravityFrame.setTarget(
            new THREE.Vector3(
                1,
                0,
                0
            )
        );
    }

    if(z < -500)
    {
        gravityFrame.setTarget(
            new THREE.Vector3(
                0,
                -1,
                0
            )
        );
    }

    if(z < -750)
    {
        gravityFrame.setTarget(
            new THREE.Vector3(
                -1,
                0,
                0
            )
        );
    }

    if(z < -1000)
    {
        gravityFrame.setTarget(
            new THREE.Vector3(
                0,
                1,
                0
            )
        );
    }
}



// ====================================================
// Resize
// ====================================================

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
            pipeline &&
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



// ====================================================
// Animation Loop
// ====================================================

function animate()
{
    requestAnimationFrame(
        animate
    );

    const delta =
        clock.getDelta();

    const elapsed =
        clock.elapsedTime;



    // Gravity

    if(gravityFrame.update)
    {
        gravityFrame.update(
            delta
        );
    }

    if(
        controller.setGravityFrame &&
        gravityFrame.getUp
    )
    {
        controller.setGravityFrame(
            gravityFrame.getUp()
        );
    }



    // Player

    if(controller.update)
    {
        controller.update(
            delta,
            elapsed
        );
    }



    // World

    if(
        graph &&
        graph.update
    )
    {
        graph.update(
            controller.getObject()
        );
    }



    // History

    if(history.record)
    {
        history.record(
            controller.getObject()
        );
    }



    updateGravityZones();

    updateMadness();



    // Portal Rendering

    if(
        portalManager &&
        portalManager.render
    )
    {
        portalManager.render(
            scene
        );
    }



    // Shader Animation

    if(
        stoneMaterial &&
        stoneMaterial.uniforms &&
        stoneMaterial.uniforms.time
    )
    {
        stoneMaterial.uniforms.time.value =
            elapsed;
    }

    if(
        fogMaterial &&
        fogMaterial.uniforms &&
        fogMaterial.uniforms.time
    )
    {
        fogMaterial.uniforms.time.value =
            elapsed;
    }



    // Final Render

    if(
        pipeline &&
        pipeline.render
    )
    {
        pipeline.render(
            elapsed,
            madness
        );
    }
    else
    {
        renderer.render(
            scene,
            camera
        );
    }
}

animate();