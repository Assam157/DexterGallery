import * as THREE from 'three';

export class RecursivePortal
{
    constructor(radius = 2)
    {
        this.renderTarget =
            new THREE.WebGLRenderTarget(
                1024,
                1024
            );

        this.material =
            new THREE.MeshBasicMaterial({
                map:
                this.renderTarget.texture
            });

        this.mesh =
            new THREE.Mesh(
                new THREE.CircleGeometry(
                    radius,
                    64
                ),
                this.material
            );

        this.virtualCamera =
            new THREE.PerspectiveCamera(
                75,
                1,
                0.1,
                1000
            );
    }

    getMesh()
    {
        return this.mesh;
    }

    updateCamera(
        position,
        quaternion
    )
    {
        this.virtualCamera.position.copy(
            position
        );

        this.virtualCamera.quaternion.copy(
            quaternion
        );
    }
}