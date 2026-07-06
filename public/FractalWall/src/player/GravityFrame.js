import * as THREE from 'three';

export class GravityFrame
{
    constructor()
    {
        this.currentUp =
            new THREE.Vector3(
                0,
                1,
                0
            );

        this.targetUp =
            new THREE.Vector3(
                0,
                1,
                0
            );
    }

    setTarget(up)
    {
        this.targetUp.copy(up);
    }

    update(delta)
    {
        this.currentUp.lerp(
            this.targetUp,
            delta * 0.4
        );

        this.currentUp.normalize();
    }

    getUp()
    {
        return this.currentUp;
    }
}