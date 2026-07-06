/***********************************************************************
 *
 * GalaxyRelaxation.js
 *
 * Milkomeda V2
 *
 * Part 1
 *
 ***********************************************************************/

import * as THREE from "three";

export class GalaxyRelaxation{

    constructor(){

        //----------------------------------------------------
        // Internal time
        //----------------------------------------------------

        this.time = 0;

        //----------------------------------------------------
        // Progress of violent relaxation
        //----------------------------------------------------

        this.progress = 0;

        //----------------------------------------------------
        // Final disk thickness multiplier
        //----------------------------------------------------

        this.diskInflation = 1.0;

        //----------------------------------------------------
        // Spiral arm visibility
        //----------------------------------------------------

        this.armStrength = 1.0;

        //----------------------------------------------------
        // Bulge growth
        //----------------------------------------------------

        this.bulgeGrowth = 1.0;

        //----------------------------------------------------
        // Orbit randomisation
        //----------------------------------------------------

        this.randomisation = 0.0;

        //----------------------------------------------------
        // Core brightness
        //----------------------------------------------------

        this.coreBoost = 1.0;

        //----------------------------------------------------
        // Ellipticity
        //----------------------------------------------------

        this.ellipticity = 0.0;

    }

    /********************************************************
                        UPDATE
    ********************************************************/

    update(

        delta,

        timeline

    ){

        this.time += delta;

        //----------------------------------------
        // Relaxation starts near final merger
        //----------------------------------------

        this.progress =

            THREE.MathUtils.smoothstep(

                timeline,

                0.72,

                1.0

            );

        //----------------------------------------
        // Inflate disk
        //----------------------------------------

        this.diskInflation =

            THREE.MathUtils.lerp(

                1.0,

                3.6,

                this.progress

            );

        //----------------------------------------
        // Fade spiral arms
        //----------------------------------------

        this.armStrength =

            THREE.MathUtils.lerp(

                1.0,

                0.0,

                this.progress

            );

        //----------------------------------------
        // Grow bulge
        //----------------------------------------

        this.bulgeGrowth =

            THREE.MathUtils.lerp(

                1.0,

                2.8,

                this.progress

            );

        //----------------------------------------
        // Random stellar orbits
        //----------------------------------------

        this.randomisation =

            THREE.MathUtils.lerp(

                0.0,

                1.0,

                this.progress

            );

        //----------------------------------------
        // Bright core
        //----------------------------------------

        this.coreBoost =

            THREE.MathUtils.lerp(

                1.0,

                2.4,

                this.progress

            );

        //----------------------------------------
        // Elliptical remnant
        //----------------------------------------

        this.ellipticity =

            THREE.MathUtils.lerp(

                0.0,

                0.45,

                this.progress

            );

    }

    /********************************************************
                    APPLY
    ********************************************************/

    apply(

        galaxy

    ){

        const radius = galaxy.radiusArray;

        const theta = galaxy.thetaArray;

        const height = galaxy.heightArray;

        const density = galaxy.densityArray;

        const temp = galaxy.temperatureArray;

        const arm = galaxy.armArray;

        //----------------------------------------------------

        for(

            let i=0;

            i<galaxy.starCount;

            i++

        ){

            //--------------------------------------------
            // Ignore halo
            //--------------------------------------------

            if(

                arm[i] > 200

            )

                continue;

            //--------------------------------------------
            // Radius factor
            //--------------------------------------------

            const edge =

                THREE.MathUtils.clamp(

                    radius[i]/

                    galaxy.radius,

                    0,

                    1

                );

            //--------------------------------------------
            // Disk thickening
            //--------------------------------------------

            height[i] *=

                THREE.MathUtils.lerp(

                    1.0,

                    this.diskInflation,

                    edge*this.progress

                );

            //--------------------------------------------
            // Spiral fade
            //--------------------------------------------

            theta[i] *=

                THREE.MathUtils.lerp(

                    1.0,

                    0.82,

                    this.progress

                );

            //--------------------------------------------
            // Density becomes smoother
            //--------------------------------------------

            density[i] =

                THREE.MathUtils.lerp(

                    density[i],

                    1.0,

                    this.progress*0.03

                );

            //--------------------------------------------
            // Younger stars age slightly
            //--------------------------------------------

            if(

                temp[i] > 8000

            ){

                temp[i] -=

                    10.0*

                    this.progress;

            }

        }

    }

    /********************************************************
                    GETTERS
    ********************************************************/

    get mergerProgress(){

        return this.progress;

    }

    get bulgeScale(){

        return this.bulgeGrowth;

    }

    get brightness(){

        return this.coreBoost;

    }

    get flattening(){

        return this.ellipticity;

    }
    /********************************************************
                    ORBIT RELAXATION
    ********************************************************/

    relaxOrbits(

        galaxy

    ){

        const theta = galaxy.thetaArray;
        const radius = galaxy.radiusArray;
        const vx = galaxy.vx;
        const vy = galaxy.vy;
        const vz = galaxy.vz;

        for(let i=0;i<galaxy.starCount;i++){

            //----------------------------------------
            // Skip halo
            //----------------------------------------

            if(galaxy.armArray[i] > 200)
                continue;

            const edge =

                THREE.MathUtils.clamp(

                    radius[i] /

                    galaxy.radius,

                    0,

                    1

                );

            //----------------------------------------
            // Lose ordered rotation
            //----------------------------------------

            theta[i] +=

                (Math.random()-0.5)

                *

                this.randomisation

                *

                edge

                *

                0.025;

            //----------------------------------------
            // Random velocity dispersion
            //----------------------------------------

            vx[i] +=

                (Math.random()-0.5)

                *

                this.randomisation

                *

                0.012;

            vy[i] +=

                (Math.random()-0.5)

                *

                this.randomisation

                *

                0.012;

            vz[i] +=

                (Math.random()-0.5)

                *

                this.randomisation

                *

                0.012;

        }

    }

    /********************************************************
                    BULGE EXPANSION
    ********************************************************/

    growBulge(

        galaxy

    ){

        const radius = galaxy.radiusArray;

        for(let i=0;i<galaxy.starCount;i++){

            if(radius[i] < galaxy.coreRadius){

                radius[i] *=

                    THREE.MathUtils.lerp(

                        1.0,

                        this.bulgeGrowth,

                        this.progress*0.015

                    );

            }

        }

    }

    /********************************************************
                    FADE SPIRAL PATTERN
    ********************************************************/

    dissolveArms(

        galaxy

    ){

        const arm = galaxy.armArray;

        for(let i=0;i<galaxy.starCount;i++){

            if(arm[i] < 200){

                if(Math.random() < this.progress*0.002){

                    arm[i]=250;

                }

            }

        }

    }

    /********************************************************
                    CORE LUMINOSITY
    ********************************************************/

    brightenCore(

        galaxy

    ){

        if(

            galaxy.renderer &&

            galaxy.renderer.material &&

            galaxy.renderer.material.uniforms &&

            galaxy.renderer.material.uniforms.uBrightness

        ){

            galaxy.renderer.material.uniforms.uBrightness.value =

                this.coreBoost;

        }

    }

    /********************************************************
                    SIMULATE
    ********************************************************/

    simulate(

        galaxy

    ){

        if(this.progress <= 0.001)
            return;

        this.apply(

            galaxy

        );

        this.relaxOrbits(

            galaxy

        );

        this.growBulge(

            galaxy

        );

        this.dissolveArms(

            galaxy

        );

        this.brightenCore(

            galaxy

        );

    }

    /********************************************************
                    RESET
    ********************************************************/

    reset(){

        this.progress = 0;

        this.diskInflation = 1.0;

        this.armStrength = 1.0;

        this.bulgeGrowth = 1.0;

        this.randomisation = 0.0;

        this.coreBoost = 1.0;

        this.ellipticity = 0.0;

    }

}