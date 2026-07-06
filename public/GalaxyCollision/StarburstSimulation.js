/***********************************************************************
 *
 * StarburstSimulation.js
 *
 * Milkomeda V2
 *
 * Collision Induced Star Formation
 *
 ***********************************************************************/

import * as THREE from "three";

export class StarburstSimulation{

    constructor({

        regions = 600,

        radius = 450

    }={}){

        this.count = regions;

        this.radius = radius;

        //--------------------------------------------------

        this.positions =

            new Float32Array(

                regions*3

            );

        this.colors =

            new Float32Array(

                regions*3

            );

        this.sizes =

            new Float32Array(

                regions

            );

        this.intensity =

            new Float32Array(

                regions

            );

        this.life =

            new Float32Array(

                regions

            );

        //--------------------------------------------------

        this.geometry =

            new THREE.BufferGeometry();

        this.geometry.setAttribute(

            "position",

            new THREE.BufferAttribute(

                this.positions,

                3

            ).setUsage(

                THREE.DynamicDrawUsage

            )

        );

        this.geometry.setAttribute(

            "color",

            new THREE.BufferAttribute(

                this.colors,

                3

            ).setUsage(

                THREE.DynamicDrawUsage

            )

        );

        //--------------------------------------------------

        this.material =

            new THREE.PointsMaterial({

                size:9,

                vertexColors:true,

                transparent:true,

                opacity:0.92,

                depthWrite:false,

                blending:

                THREE.AdditiveBlending,

                sizeAttenuation:true

            });

        this.material.toneMapped=false;

        //--------------------------------------------------

        this.points =

            new THREE.Points(

                this.geometry,

                this.material

            );

        this.points.frustumCulled=false;

        //--------------------------------------------------

        this.group = new THREE.Group();

        this.group.add(

            this.points

        );

        //--------------------------------------------------

        this.initialize();

    }

    /********************************************************
                    INITIALIZE
    ********************************************************/

    initialize(){

        for(

            let i=0;

            i<this.count;

            i++

        ){

            const p=i*3;

            this.positions[p]=99999;
            this.positions[p+1]=99999;
            this.positions[p+2]=99999;

            this.colors[p]=0.65;
            this.colors[p+1]=0.82;
            this.colors[p+2]=1.0;

            this.sizes[i]=

                4+

                Math.random()*10;

            this.life[i]=0;

            this.intensity[i]=0;

        }

    }
        /********************************************************
                    UPDATE
    ********************************************************/

    update(

        delta,

        gas,

        mergerStrength

    ){

        const pos =
            this.positions;

        const col =
            this.colors;

        const dt = delta;

        //--------------------------------------------------
        // Number of active regions
        //--------------------------------------------------

        const activeTarget =

            Math.floor(

                mergerStrength *

                this.count

            );

        //--------------------------------------------------

        let active = 0;

        for(

            let i=0;

            i<this.count;

            i++

        ){

            const p=i*3;

            //------------------------------------------
            // Fade
            //------------------------------------------

            this.life[i]*=0.992;

            //------------------------------------------
            // Spawn
            //------------------------------------------

            if(

                this.life[i]<0.05 &&

                active<activeTarget

            ){

                //----------------------------------

                const g =

                    Math.floor(

                        Math.random()

                        *gas.count

                    );

                //----------------------------------

                if(

                    gas.density[g]>

                    0.65

                ){

                    const gp=g*3;

                    //----------------------------------

                    pos[p]=

                        gas.positions[gp];

                    pos[p+1]=

                        gas.positions[gp+1];

                    pos[p+2]=

                        gas.positions[gp+2];

                    //----------------------------------

                    this.life[i]=1;

                    this.intensity[i]=1;

                    //----------------------------------

                    this.sizes[i]=

                        6+

                        Math.random()*12;

                }

            }

            //------------------------------------------
            // Alive
            //------------------------------------------

            if(this.life[i]>0.02){

                active++;

            }

            //------------------------------------------
            // Fade
            //------------------------------------------

            this.intensity[i]=

                this.life[i];

            //------------------------------------------
            // Blue → White
            //------------------------------------------

            col[p]=

                THREE.MathUtils.lerp(

                    0.5,

                    1.0,

                    this.intensity[i]

                );

            col[p+1]=

                THREE.MathUtils.lerp(

                    0.75,

                    0.95,

                    this.intensity[i]

                );

            col[p+2]=1.0;

            //------------------------------------------
            // Flicker
            //------------------------------------------

            this.life[i]-=

                dt*

                0.00025;

        }

        //--------------------------------------------------

        this.geometry.attributes.position.needsUpdate=true;

        this.geometry.attributes.color.needsUpdate=true;

    }
        /********************************************************
                    OPACITY
    ********************************************************/

    setOpacity(value){

        this.material.opacity=value;

    }

    /********************************************************
                    VISIBILITY
    ********************************************************/

    setVisible(value){

        this.group.visible=value;

    }

    /********************************************************
                    OBJECT
    ********************************************************/

    get object(){

        return this.group;

    }

    /********************************************************
                    DISPOSE
    ********************************************************/

    dispose(){

        this.geometry.dispose();

        this.material.dispose();

    }

}