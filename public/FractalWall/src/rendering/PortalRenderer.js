export class PortalRenderer
{
    constructor(renderer)
    {
        this.renderer =
            renderer;

        this.portals = [];
    }

    add(portal)
    {
        this.portals.push(
            portal
        );
    }

    render(scene)
    {
        for(
            const portal
            of this.portals
        )
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