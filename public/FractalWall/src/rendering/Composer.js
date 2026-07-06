import * as THREE from 'three';

import { EffectComposer }
from 'three/addons/postprocessing/EffectComposer.js';

import { RenderPass }
from 'three/addons/postprocessing/RenderPass.js';

import { UnrealBloomPass }
from 'three/addons/postprocessing/UnrealBloomPass.js';

export class Composer
{
    constructor(
        renderer,
        scene,
        camera
    )
    {
        this.composer =
            new EffectComposer(
                renderer
            );

        this.renderPass =
            new RenderPass(
                scene,
                camera
            );

        this.composer.addPass(
            this.renderPass
        );

        this.bloomPass =
            new UnrealBloomPass(
                new THREE.Vector2(
                    window.innerWidth,
                    window.innerHeight
                ),
                0.35,
                0.4,
                0.85
            );

        this.composer.addPass(
            this.bloomPass
        );
    }

    render()
    {
        this.composer.render();
    }

    resize(w,h)
    {
        this.composer.setSize(
            w,
            h
        );
    }
}