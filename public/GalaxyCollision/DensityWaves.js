/***********************************************************************
 *
 * DensityWave.js
 *
 * Milkomeda V2
 *
 * Spiral Density Wave Simulator
 *
 ***********************************************************************/

import * as THREE from "three";

export class DensityWave{

    constructor(){

        //----------------------------------------

        this.time = 0;

        //----------------------------------------

        this.amplitude = 0.18;

        this.frequency = 0.045;

        this.speed = 0.32;

        //----------------------------------------

        this.compression = 0.0;

    }

    /********************************************************
                    UPDATE
    ********************************************************/

    update(delta){

        this.time += delta;

    }

    /********************************************************
                    APPLY
    ********************************************************/

    apply(

        galaxy,

        interactionStrength

    ){

        const theta = galaxy.thetaArray;

        const radius = galaxy.radiusArray;

        const height = galaxy.heightArray;

        for(

            let i=0;

            i<galaxy.starCount;

            i++

        ){

            //------------------------------------

            if(

                galaxy.armArray[i] > 20

            )

                continue;

            //------------------------------------

            const r = radius[i];

            //------------------------------------

            const wave =

                Math.sin(

                    r*this.frequency

                    -

                    this.time*this.speed

                );

            //------------------------------------

            const edge =

                THREE.MathUtils.smoothstep(

                    r,

                    galaxy.radius*0.25,

                    galaxy.radius

                );

            //------------------------------------

            theta[i] +=

                wave *

                edge *

                this.amplitude *

                interactionStrength;

            //------------------------------------

            height[i] +=

                wave *

                edge *

                0.08;

        }

    }
        /********************************************************
                    COMPRESS ARMS
    ********************************************************/

    compressArms(

        galaxy,

        interactionStrength

    ){

        const density = galaxy.densityArray;

        const radius  = galaxy.radiusArray;

        const theta   = galaxy.thetaArray;

        for(let i=0;i<galaxy.starCount;i++){

            if(galaxy.armArray[i] > 20)
                continue;

            const wave =

                Math.sin(

                    radius[i]*0.055

                    -

                    this.time*0.28

                    +

                    theta[i]*2.5

                );

            density[i] =

                THREE.MathUtils.lerp(

                    density[i],

                    1.0 +

                    Math.max(0,wave)

                    *interactionStrength

                    *1.4,

                    0.08

                );

        }

    }

    /********************************************************
                    WARP DISK
    ********************************************************/

    warpDisk(

        galaxy,

        interactionStrength

    ){

        const radius = galaxy.radiusArray;
        const height = galaxy.heightArray;
        const theta  = galaxy.thetaArray;

        for(let i=0;i<galaxy.starCount;i++){

            const edge =

                THREE.MathUtils.smoothstep(

                    radius[i],

                    galaxy.radius*0.45,

                    galaxy.radius

                );

            height[i] +=

                Math.sin(

                    theta[i]

                    +

                    this.time*0.22

                )

                *

                edge

                *

                interactionStrength

                *

                0.08;

        }

    }

    /********************************************************
                    STARBURST TRIGGER
    ********************************************************/

    triggerStarFormation(

        galaxy,

        interactionStrength

    ){

        const density = galaxy.densityArray;
        const temp    = galaxy.temperatureArray;

        for(let i=0;i<galaxy.starCount;i++){

            if(

                density[i] >

                1.55

            ){

                temp[i] =

                    THREE.MathUtils.lerp(

                        temp[i],

                        11000,

                        interactionStrength*0.02

                    );

            }

        }

    }

    /********************************************************
                    COMPLETE UPDATE
    ********************************************************/

    simulate(

        galaxy,

        interactionStrength

    ){

        this.apply(

            galaxy,

            interactionStrength

        );

        this.compressArms(

            galaxy,

            interactionStrength

        );

        this.warpDisk(

            galaxy,

            interactionStrength

        );

        this.triggerStarFormation(

            galaxy,

            interactionStrength

        );

    }

}

 