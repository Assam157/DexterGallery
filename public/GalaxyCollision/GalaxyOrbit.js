/***********************************************************************
 *
 * GalaxyOrbit.js
 *
 * Milkomeda V2
 *
 * Controls the orbital motion of the two galaxy centres.
 *
 ***********************************************************************/

import * as THREE from "three";

export class GalaxyOrbit{

    constructor(galaxyA, galaxyB){

        this.a = galaxyA;
        this.b = galaxyB;

        //--------------------------------------------------
        // Timeline (0 → 1)
        //--------------------------------------------------

        this.progress = 0;

        //--------------------------------------------------
        // Initial separation
        //--------------------------------------------------

        this.initialDistance = 900;

        //--------------------------------------------------
        // Closest approach
        //--------------------------------------------------

        this.pericenter = 120;

        //--------------------------------------------------
        // Final merged position
        //--------------------------------------------------

        this.finalPosition = new THREE.Vector3(
            0,
            0,
            0
        );

        //--------------------------------------------------
        // Temporary vectors
        //--------------------------------------------------

        this.posA = new THREE.Vector3();
        this.posB = new THREE.Vector3();

    }

    /********************************************************
                        TIMELINE
    ********************************************************/

    setProgress(value){

        this.progress = THREE.MathUtils.clamp(
            value,
            0,
            1
        );

    }

    /********************************************************
                        COMPUTEORBIT
    ********************************************************/

     computeOrbit(){

    const t = this.progress;

    //--------------------------------------------------
    // Shrinking orbital radius
    //--------------------------------------------------

    const radius = THREE.MathUtils.lerp(

        this.initialDistance,

        0,

        Math.pow(t,1.35)

    );

    //--------------------------------------------------
    // About 1.3 revolutions before merger
    //--------------------------------------------------

    const angle =

        t * Math.PI * 2.6;

    //--------------------------------------------------
    // Small vertical offset
    //--------------------------------------------------

    const y =

        Math.sin(t*Math.PI)*35;

    //--------------------------------------------------
    // Milky Way
    //--------------------------------------------------

    this.posA.set(

        Math.sin(angle)*radius,

        y,

        -Math.cos(angle)*radius

    );

    //--------------------------------------------------
    // Andromeda
    //--------------------------------------------------

    this.posB.set(

        -Math.sin(angle)*radius,

        -y,

        Math.cos(angle)*radius

    );

}
    /********************************************************
                    ORBIT TILT
    ********************************************************/

     applyInclination(){

    const merge = THREE.MathUtils.smoothstep(

        this.progress,

        0.75,

        1.0

    );

    this.a.setRotation(

        THREE.MathUtils.lerp(

            1.02,

            0.25,

            merge

        ),

        this.progress*0.15,

        0

    );

    this.b.setRotation(

        THREE.MathUtils.lerp(

            -0.72,

            0.25,

            merge

        ),

        -this.progress*0.12,

        0.2*(1-merge)

    );

}

    /********************************************************
                    SECOND PASS
    ********************************************************/

    secondPass(){

    if(this.progress<0.55) return;
    if(this.progress>0.90) return;

    const t=(this.progress-0.55)/0.35;

    const swirl=

        Math.sin(t*Math.PI);

    this.posA.x += swirl*45;
    this.posA.z -= swirl*30;

    this.posB.x -= swirl*45;
    this.posB.z += swirl*30;

}

    /********************************************************
                    FINAL RELAXATION
    ********************************************************/

    relax(){

    if(this.progress<0.90)
        return;

    const t=(this.progress-0.90)/0.10;

    const settle=

        Math.exp(-6*t);

    this.posA.multiplyScalar(settle);

    this.posB.multiplyScalar(settle);

}

    /********************************************************
                    UPDATE
    ********************************************************/

    update(){

        //------------------------------------------
        // Existing orbit solution
        //------------------------------------------

        this.computeOrbit();

        //------------------------------------------
        // Second encounter
        //------------------------------------------

        this.secondPass();

        //------------------------------------------
        // Final settling
        //------------------------------------------

        this.relax();

        //------------------------------------------
        // Disk inclination
        //------------------------------------------

        this.applyInclination();

        //------------------------------------------
        // Apply positions
        //------------------------------------------

        this.a.setPosition(

            this.posA.x,
            this.posA.y,
            this.posA.z

        );

        this.b.setPosition(

            this.posB.x,
            this.posB.y,
            this.posB.z

        );

    }

}
 