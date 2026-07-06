import { Composer }
from './Composer.js';

import { PortalRenderer }
from './PortalRenderer.js';

import { RealityBreakPass }
from './RealityBreakPass.js';

export class RenderPipeline
{
    constructor(
        renderer,
        scene,
        camera
    )
    {
        this.renderer =
            renderer;

        this.scene =
            scene;

        this.camera =
            camera;

        this.portalRenderer =
            new PortalRenderer(
                renderer
            );

        this.composer =
            new Composer(
                renderer,
                scene,
                camera
            );

        this.realityPass =
            new RealityBreakPass();

        this.composer.composer.addPass(
            this.realityPass.pass
        );
    }

    render(
        elapsed,
        madness
    )
    {
        this.portalRenderer.render(
            this.scene
        );

        this.realityPass.update(
            elapsed,
            madness
        );

        this.composer.render();
    }
}