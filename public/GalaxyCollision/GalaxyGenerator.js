/***********************************************************************
 *
 * GalaxyGenerator.js
 *
 * Milkomeda V2
 *
 * Realistic Spiral Galaxy Generator
 *
 ***********************************************************************/

import * as THREE from "three";

export class GalaxyGenerator{

    constructor(galaxy){

        this.galaxy = galaxy;

        this.randomSeed = Math.random()*1000.0;

    }

    /********************************************************
                    GENERATE
    ********************************************************/

    generate(){

        this.generateBulge();

        this.generateDisk();

        this.generateHalo();
        this.finalize();

    }

    /********************************************************
                    BULGE
    ********************************************************/

    generateBulge(){

        const g=this.galaxy;

        const count=Math.floor(

            g.starCount*0.18

        );

        for(let i=0;i<count;i++){

            const r=

                Math.pow(

                    Math.random(),

                    2.6

                )*

                g.coreRadius;

            const theta=

                Math.random()

                *Math.PI*2;

            const phi=

                Math.acos(

                    2*Math.random()-1

                );

            g.radiusArray[i]=r;

            g.thetaArray[i]=theta;

            g.heightArray[i]=

                Math.cos(phi)

                *r*0.75;

            g.speedArray[i]=

                0.040/

                Math.sqrt(

                    r+2.0

                );

            g.massArray[i]=

                2+

                Math.random()*3;

            g.temperatureArray[i]=

                5200+

                Math.random()*800;
                g.densityArray[i]=1.0;

            g.armArray[i]=255;

        }

    }

    /********************************************************
                    DISK
    ********************************************************/

    generateDisk(){

        const g=this.galaxy;

        const start=

            Math.floor(

                g.starCount*0.18

            );

        const end=

            Math.floor(

                g.starCount*0.92

            );

        for(

            let i=start;

            i<end;

            i++

        ){

            //----------------------------------------

            const arm=

                i%

                g.armCount;

            //----------------------------------------

            const radius=

                Math.pow(

                    Math.random(),

                    1.55

                )

                *

                g.radius;

            //----------------------------------------

            // Logarithmic spiral
            //----------------------------------------

            const angle=

                arm

                *

                (

                    Math.PI*2/

                    g.armCount

                )

                +

                Math.log(

                    radius+1.0

                )

                *4.5

                +

                (

                    Math.random()-0.5

                )

                *g.armSpread;

            g.radiusArray[i]=radius;

            g.thetaArray[i]=angle;

            //----------------------------------------

            // Thin disk
            //----------------------------------------

            g.heightArray[i]=

                (

                    Math.random()-0.5

                )

                *

                g.diskThickness;

            //----------------------------------------

            // Differential rotation
            //----------------------------------------

            g.speedArray[i]=

                0.080/

                Math.sqrt(

                    radius+1

                );

            //----------------------------------------

            g.massArray[i]=1;

            g.temperatureArray[i]=

                4500+

                Math.random()*4500;
                g.densityArray[i]=1.0;

            g.armArray[i]=arm;

        }

    }
        /********************************************************
                    HALO
    ********************************************************/

    generateHalo(){

        const g = this.galaxy;

        const start = Math.floor(g.starCount * 0.92);

        for(let i=start;i<g.starCount;i++){

            const r =

                g.radius +

                Math.random() *

                (g.haloRadius-g.radius);

            const theta =

                Math.random() *

                Math.PI * 2.0;

            const phi =

                Math.acos(

                    2.0*Math.random()-1.0

                );

            g.radiusArray[i]=r;

            g.thetaArray[i]=theta;

            g.heightArray[i]=

                Math.cos(phi)

                *r*0.65;

            g.speedArray[i]=

                0.018/

                Math.sqrt(r);

            g.massArray[i]=0.4;

            g.temperatureArray[i]=4800;
            g.densityArray[i]=1.0;

            g.armArray[i]=254;

        }

    }

    /********************************************************
                    ARM FEATHERING
    ********************************************************/

    featherArms(){

        const g=this.galaxy;

        for(let i=0;i<g.starCount;i++){

            if(g.armArray[i]>10)
                continue;

            const r=g.radiusArray[i];

            const feather=

                Math.sin(r*0.08)

                *

                0.18;

            g.thetaArray[i]+=

                feather;

        }

    }

    /********************************************************
                    STAR FORMING CLUMPS
    ********************************************************/

    addStarFormingRegions(){

        const g=this.galaxy;

        for(let i=0;i<g.starCount;i++){

            if(g.armArray[i]>10)
                continue;

            const r=g.radiusArray[i];

            const wave=

                Math.sin(

                    r*0.18+

                    g.thetaArray[i]*3.0

                );

            if(wave>0.82){

                //--------------------------------------
                // Younger stars
                //--------------------------------------

                g.temperatureArray[i]=

                    8500+

                    Math.random()*3500;
                    g.densityArray[i]=1.0;

                //--------------------------------------
                // Brighter
                //--------------------------------------

                g.massArray[i]*=2.2;

            }

        }

    }

    /********************************************************
                    ARM BIFURCATION
    ********************************************************/

    splitArms(){

        const g=this.galaxy;

        for(let i=0;i<g.starCount;i++){

            if(g.armArray[i]>10)
                continue;

            const r=g.radiusArray[i];

            if(r<g.radius*0.45)
                continue;

            const split=

                Math.sin(

                    r*0.035

                );

            g.thetaArray[i]+=

                split*

                0.12;

        }

    }

    /********************************************************
                    DUST GAPS
    ********************************************************/

    createDustLanes(){

        const g=this.galaxy;

        for(let i=0;i<g.starCount;i++){

            const r=g.radiusArray[i];

            if(

                r>

                g.radius*0.25

                &&

                r<

                g.radius*0.75

            ){

                const lane=

                    Math.sin(

                        g.thetaArray[i]*2.0+

                        r*0.04

                    );

                if(lane>0.75){

                    g.temperatureArray[i]-=450;
                    g.densityArray[i]=1.0;
                

                    g.massArray[i]*=0.75;

                }

            }

        }

    }

    /********************************************************
                    FINALIZE
    ********************************************************/

    finalize(){

        this.featherArms();

        this.splitArms();

        this.addStarFormingRegions();

        this.createDustLanes();

    }

}