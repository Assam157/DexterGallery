/***********************************************************************
 *
 * StarPopulation.js
 *
 * Milkomeda V2
 *
 * Stellar Population Generator
 *
 ***********************************************************************/

import * as THREE from "three";

export class StarPopulation{

    constructor(galaxy){

        this.galaxy = galaxy;

        this.count = galaxy.starCount;

        //------------------------------------------------

        this.temperature =

            new Float32Array(

                this.count

            );

        this.luminosity =

            new Float32Array(

                this.count

            );

        this.age =

            new Float32Array(

                this.count

            );

        this.population =

            new Uint8Array(

                this.count

            );

        this.scale =

            new Float32Array(

                this.count

            );

        //------------------------------------------------

        this.generate();

    }

    /********************************************************
                        GENERATE
    ********************************************************/

    generate(){

        for(

            let i=0;

            i<this.count;

            i++

        ){

            const r =

                this.galaxy.radiusArray[i];

            //--------------------------------------------
            // Bulge
            //--------------------------------------------

            if(

                r <

                this.galaxy.coreRadius*1.8

            ){

                this.population[i]=0;

                this.temperature[i]=5200;

                this.age[i]=0.95;

                this.luminosity[i]=1.6;

                this.scale[i]=1.4;

            }

            //--------------------------------------------
            // Inner Disk
            //--------------------------------------------

            else if(

                r <

                this.galaxy.radius*0.45

            ){

                this.population[i]=1;

                this.temperature[i]=6000;

                this.age[i]=0.55;

                this.luminosity[i]=1.0;

                this.scale[i]=1.0;

            }

            //--------------------------------------------
            // Spiral Arms
            //--------------------------------------------

            else if(

                r <

                this.galaxy.radius

            ){

                this.population[i]=2;

                this.temperature[i]=8500;

                this.age[i]=0.18;

                this.luminosity[i]=2.4;

                this.scale[i]=1.25;

            }

            //--------------------------------------------
            // Halo
            //--------------------------------------------

            else{

                this.population[i]=3;

                this.temperature[i]=4700;

                this.age[i]=1.0;

                this.luminosity[i]=0.8;

                this.scale[i]=0.75;

            }

        }

    }
        /********************************************************
                    BUILD GPU ATTRIBUTES
    ********************************************************/

    buildAttributes(){

        const count = this.count;

        this.temperatureAttribute =
            new Float32Array(count);

        this.luminosityAttribute =
            new Float32Array(count);

        this.populationAttribute =
            new Float32Array(count);

        this.scaleAttribute =
            new Float32Array(count);

        for(let i=0;i<count;i++){

            //------------------------------------------
            // Normalize temperature
            //------------------------------------------

            this.temperatureAttribute[i] =

                THREE.MathUtils.clamp(

                    (this.temperature[i]-3500.0)/6500.0,

                    0,

                    1

                );

            //------------------------------------------

            this.luminosityAttribute[i] =

                this.luminosity[i];

            //------------------------------------------

            this.populationAttribute[i] =

                this.population[i];

            //------------------------------------------

            this.scaleAttribute[i] =

                this.scale[i];

        }

    }

    /********************************************************
                    APPLY TO GEOMETRY
    ********************************************************/

    applyToGeometry(){

        const geometry =

            this.galaxy.geometry;

        geometry.setAttribute(

            "temperature",

            new THREE.BufferAttribute(

                this.temperatureAttribute,

                1

            )

        );

        geometry.setAttribute(

            "luminosity",

            new THREE.BufferAttribute(

                this.luminosityAttribute,

                1

            )

        );

        geometry.setAttribute(

            "population",

            new THREE.BufferAttribute(

                this.populationAttribute,

                1

            )

        );

        geometry.setAttribute(

            "starScale",

            new THREE.BufferAttribute(

                this.scaleAttribute,

                1

            )

        );

    }

    /********************************************************
                    RANDOMIZE
    ********************************************************/

    randomize(){

        for(let i=0;i<this.count;i++){

            this.temperature[i] +=

                (Math.random()-0.5)*250.0;

            this.luminosity[i] *=

                THREE.MathUtils.lerp(

                    0.85,

                    1.20,

                    Math.random()

                );

            this.scale[i] *=

                THREE.MathUtils.lerp(

                    0.90,

                    1.15,

                    Math.random()

                );

        }

    }

    /********************************************************
                    UPDATE
    ********************************************************/

    update(){

        const geometry =

            this.galaxy.geometry;

        geometry.attributes.temperature.needsUpdate = true;

        geometry.attributes.luminosity.needsUpdate = true;

        geometry.attributes.starScale.needsUpdate = true;

    }

    /********************************************************
                    INITIALIZE
    ********************************************************/

    initialize(){

        this.randomize();

        this.buildAttributes();

        this.applyToGeometry();

        this.update();
    }

}