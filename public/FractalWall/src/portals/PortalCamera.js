import * as THREE from 'three';

export class PortalCamera
{
    constructor()
    {
        this.camera =
            new THREE.PerspectiveCamera(
                75,
                window.innerWidth /
                window.innerHeight,
                0.1,
                1000
            );
    }

    sync(playerCamera)
    {
        this.camera.position.copy(
            playerCamera.position
        );

        this.camera.quaternion.copy(
            playerCamera.quaternion
        );
    }

    getCamera()
    {
        return this.camera;
    }
}