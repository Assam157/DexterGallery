/***********************************************************************
 *
 * GravityField.js
 *
 * Milkomeda V2
 *
 * Global Gravitational Field
 *
 ***********************************************************************/

import * as THREE from "three";

export class GravityField{

    constructor(){

        //----------------------------------------------------
        // Artificial gravity constant
        //----------------------------------------------------

        this.G = 22.0;

        //----------------------------------------------------
        // Numerical softening
        //----------------------------------------------------

        this.softening = 120;

        //----------------------------------------------------

        this.time = 0;

        //----------------------------------------------------
        // Temporary vectors (avoid allocations)
        //----------------------------------------------------

        this.force = new THREE.Vector3();

        this.delta = new THREE.Vector3();

        //----------------------------------------------------
        // Interaction strength
        //----------------------------------------------------

        this.strength = 0;

    }

    /********************************************************
                    UPDATE
    ********************************************************/

    update(delta){

        this.time += delta;

    }

    /********************************************************
                    SAMPLE FIELD
    ********************************************************/

    sample(

        x,
        y,
        z,

        sourceGalaxy,

        targetGalaxy

    ){

        //----------------------------------------------------
        // Target galaxy centre
        //----------------------------------------------------

        const center =

            targetGalaxy.object.position;

        //----------------------------------------------------
        // Direction
        //----------------------------------------------------

        const dx = center.x - x;
        const dy = center.y - y;
        const dz = center.z - z;

        //----------------------------------------------------
        // Distance
        //----------------------------------------------------

        const d2 =

            dx*dx +

            dy*dy +

            dz*dz +

            this.softening;

        const d = Math.sqrt(d2);

        //----------------------------------------------------
        // Newtonian Gravity
        //----------------------------------------------------

         const force =

    this.G /

    Math.pow(

        d2,

        0.85

    );

        //----------------------------------------------------
        // Return vector
        //----------------------------------------------------

        this.force.set(

            dx/d,

            dy/d,

            dz/d

        );

        this.force.multiplyScalar(

            force

        );

        return this.force;

    }
        /********************************************************
                    TIDAL FIELD
    ********************************************************/

    applyToGalaxy(

        source,

        target

    ){

        const sx = source.object.position.x;
        const sy = source.object.position.y;
        const sz = source.object.position.z;

        const radius = source.radiusArray;
        const theta = source.thetaArray;

        for(

            let i=0;

            i<source.starCount;

            i++

        ){

            //------------------------------------------
            // Ignore dense bulge
            //------------------------------------------

            if(radius[i] < source.coreRadius)
                continue;

            //------------------------------------------
            // Current star position
            //------------------------------------------

            const angle = theta[i];

            const px =

                sx +

                Math.cos(angle)*radius[i] +

                source.offsetX[i];

            const py =

                sy +

                source.heightArray[i] +

                source.offsetY[i];

            const pz =

                sz +

                Math.sin(angle)*radius[i] +

                source.offsetZ[i];

            //------------------------------------------
            // Sample field
            //------------------------------------------

            const f = this.sample(

                px,

                py,

                pz,

                source,

                target

            );

            //------------------------------------------
            // Outer stars stretch more
            //------------------------------------------

            const edge =

                THREE.MathUtils.smoothstep(

                    radius[i],

                    source.radius*0.2,

                    source.radius

                );

            //------------------------------------------
            // Tidal amplification
            //------------------------------------------

            const tidal =

                edge *

                2.4;

            //------------------------------------------
            // Apply force
            //------------------------------------------

            source.addForce(

                i,

                f.x * tidal,

                f.y * tidal,

                f.z * tidal

            );

        }

    }

   
     
        /********************************************************
                    ORBITAL SHEAR
    ********************************************************/

    applyShear(

        source,

        target

    ){

        const tx = target.object.position.x;
        const tz = target.object.position.z;

        for(

            let i=0;

            i<source.starCount;

            i++

        ){

            //--------------------------------------
            // Current position
            //--------------------------------------

            const px =

                source.object.position.x +

                Math.cos(

                    source.thetaArray[i]

                )*

                source.radiusArray[i]

                +

                source.offsetX[i];

            const pz =

                source.object.position.z +

                Math.sin(

                    source.thetaArray[i]

                )*

                source.radiusArray[i]

                +

                source.offsetZ[i];

            //--------------------------------------
            // Tangential vector
            //--------------------------------------

            const dx = tx-px;
            const dz = tz-pz;

            const dist =

                Math.sqrt(

                    dx*dx+

                    dz*dz

                )+1;

            //--------------------------------------
            // Outer stars shear more
            //--------------------------------------

            const edge =

                THREE.MathUtils.smoothstep(

                    source.radiusArray[i],

                    source.radius*0.35,

                    source.radius

                );

            //--------------------------------------
            // Tangential force
            //--------------------------------------

            const shear =

                edge*

                0.08/

                dist;

            //--------------------------------------
            // Apply 90° rotated force
            //--------------------------------------

            source.addForce(

                i,

                -dz*shear,

                0,

                dx*shear

            );

        }

    }

    /********************************************************
                    COMPLETE INTERACTION
    ********************************************************/

    interact(

        galaxyA,

        galaxyB

    ){

        //------------------------------------------

        this.applyToGalaxy(

            galaxyA,

            galaxyB

        );

        //------------------------------------------

        this.applyToGalaxy(

            galaxyB,

            galaxyA

        );

        //------------------------------------------

        this.applyShear(

            galaxyA,

            galaxyB

        );

        //------------------------------------------

        this.applyShear(

            galaxyB,

            galaxyA

        );

    }

    /********************************************************
                    MERGER PROGRESS
    ********************************************************/

    mergerStrength(

        galaxyA,

        galaxyB

    ){

        const d =

            galaxyA.object.position.distanceTo(

                galaxyB.object.position

            );

        return THREE.MathUtils.clamp(

            1 -

            d/1800,

            0,

            1

        );

    }

}

    
 


