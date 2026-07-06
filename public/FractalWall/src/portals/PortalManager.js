import * as THREE from 'three';

export class PortalManager
{
    constructor(renderer)
    {
        this.renderer =
            renderer;

        this.portals = [];

        this.recursionDepth = 4;
    }

    addPortal(portal)
    {
        this.portals.push(
            portal
        );
    }

    render(scene)
    {
        for(const portal of this.portals)
        {
            this.renderer.setRenderTarget(
                portal.renderTarget
            );

            this.renderer.render(
                scene,
                portal.virtualCamera
            );
        }

        this.renderer.setRenderTarget(
            null
        );
    }
}