/**********************************************************************
 * CameraRig.js
 *
 * Cinematic Camera Controller
 * Milkomeda Simulation
 *********************************************************************/

import * as THREE from
"https://unpkg.com/three@0.159.0/build/three.module.js";

export class CameraRig{

    constructor(camera){

        this.camera = camera;

        this.clock = 0;

        this.lookTarget = new THREE.Vector3();

        this.orbitRadius = 900;

        this.baseHeight = 180;

        this.currentRadius = this.orbitRadius;

        this.currentHeight = this.baseHeight;

        this.currentTarget = new THREE.Vector3();

    }

    //----------------------------------------------------

    update(delta,state){

        this.clock += delta * 0.001;

        //------------------------------------------
        // Camera radius
        //------------------------------------------

        const targetRadius =

            THREE.MathUtils.lerp(

                900,

                550,

                state.zoom

            );

        this.currentRadius = THREE.MathUtils.lerp(

            this.currentRadius,

            targetRadius,

            0.02

        );

        //------------------------------------------
        // Height
        //------------------------------------------

        const targetHeight =

            THREE.MathUtils.lerp(

                180,

                90,

                state.zoom

            );

        this.currentHeight = THREE.MathUtils.lerp(

            this.currentHeight,

            targetHeight,

            0.03

        );

        //------------------------------------------
        // Orbit angle
        //------------------------------------------

        const angle =

            this.clock * 0.22;

        //------------------------------------------
        // Camera coordinates
        //------------------------------------------

        this.camera.position.x =

            Math.cos(angle)

            * this.currentRadius;

        this.camera.position.z =

            Math.sin(angle)

            * this.currentRadius;

        this.camera.position.y =

            this.currentHeight

            +

            Math.sin(

                this.clock*0.4

            )*18;

        //------------------------------------------
        // Focus drift
        //------------------------------------------

        this.currentTarget.x =

            Math.sin(

                this.clock*0.15

            )*20;

        this.currentTarget.y =

            Math.sin(

                this.clock*0.11

            )*6;

        this.currentTarget.z =

            0;

        //------------------------------------------
        // During collision
        //------------------------------------------

        this.currentTarget.z +=

            state.flash

            *25;

        //------------------------------------------
        // Look
        //------------------------------------------

        this.camera.lookAt(

            this.currentTarget

        );

    }

}