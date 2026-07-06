/***********************************************************************
 *
 * TidalField.js
 *
 * Milkomeda V2
 *
 * Computes differential tidal forces
 *
 ***********************************************************************/

import * as THREE from "three";

export class TidalField{

    constructor(){

        //--------------------------------------------

        this.strength = 1.0;

        this.falloff = 0.00018;

        this.softening = 180;

        //--------------------------------------------

        this.tmp = new THREE.Vector3();

    }

    /********************************************************
                        SAMPLE
    ********************************************************/

    sample(

        position,

        sourceCenter,

        targetCenter

    ){

        //----------------------------------------
        // Star relative to source galaxy
        //----------------------------------------

        const local =

            this.tmp.copy(position)

                .sub(sourceCenter);

        //----------------------------------------
        // Source -> Target direction
        //----------------------------------------

        const axis =

            new THREE.Vector3()

                .subVectors(

                    targetCenter,

                    sourceCenter

                );

        const distance =

            axis.length();

        axis.normalize();

        //----------------------------------------
        // Projection onto interaction axis
        //----------------------------------------

        const parallel =

            local.dot(axis);

        //----------------------------------------
        // Stretching component
        //----------------------------------------

        const force =

            parallel *

            this.falloff *

            this.strength *

            distance /

            (distance + this.softening);

        //----------------------------------------
        // Return tidal vector
        //----------------------------------------

        return axis.multiplyScalar(force);

    }
        /********************************************************
                    APPLY TO GALAXY
    ********************************************************/

    applyToGalaxy(

        source,

        target

    ){

        const sourceCenter = source.object.position;
        const targetCenter = target.object.position;

        for(

            let i=0;

            i<source.starCount;

            i++

        ){

            //----------------------------------------
            // Ignore bulge
            //----------------------------------------

            if(

                source.radiusArray[i] <

                source.coreRadius

            )

                continue;

            //----------------------------------------
            // Star world position
            //----------------------------------------

            const angle = source.thetaArray[i];
            const radius = source.radiusArray[i];

            const px =

                sourceCenter.x +

                Math.cos(angle) * radius +

                source.offsetX[i];

            const py =

                sourceCenter.y +

                source.heightArray[i] +

                source.offsetY[i];

            const pz =

                sourceCenter.z +

                Math.sin(angle) * radius +

                source.offsetZ[i];

            //----------------------------------------
            // Sample tidal field
            //----------------------------------------

            const tidal = this.sample(

                new THREE.Vector3(

                    px,

                    py,

                    pz

                ),

                sourceCenter,

                targetCenter

            );

            //----------------------------------------
            // Outer stars stretch more
            //----------------------------------------

            const edge =

                THREE.MathUtils.smoothstep(

                    radius,

                    source.radius*0.30,

                    source.radius

                );

            //----------------------------------------
            // Apply force
            //----------------------------------------

            source.addForce(

                i,

                tidal.x * edge,

                tidal.y * edge,

                tidal.z * edge

            );

        }

    }

    /********************************************************
                    GALAXY PAIR
    ********************************************************/

    interact(

        galaxyA,

        galaxyB

    ){

        this.applyToGalaxy(

            galaxyA,

            galaxyB

        );

        this.applyToGalaxy(

            galaxyB,

            galaxyA

        );

    }

}

 
