/***********************************************************************
 *
 * GasSimulation.js
 *
 * Milkomeda V2
 *
 * Diffuse Interstellar Gas
 *
 ***********************************************************************/

import * as THREE from "three";

export class GasSimulation{

    constructor({

        particles = 35000,

        radius = 450

    }={}){

        this.count = particles;

        this.radius = radius;

        //--------------------------------------------------
        // GPU Buffers
        //--------------------------------------------------

        this.positions =

            new Float32Array(

                particles*3

            );

        this.colors =

            new Float32Array(

                particles*3

            );

        this.sizes =

            new Float32Array(

                particles

            );

        //--------------------------------------------------
        // Physics
        //--------------------------------------------------

        this.vx =

            new Float32Array(

                particles

            );

        this.vy =

            new Float32Array(

                particles

            );

        this.vz =

            new Float32Array(

                particles

            );

        this.temperature =

            new Float32Array(

                particles

            );

        this.density =

            new Float32Array(

                particles

            );

        this.life =

            new Float32Array(

                particles

            );

        //--------------------------------------------------
        // Scene
        //--------------------------------------------------

        this.group = new THREE.Group();

        //--------------------------------------------------

        this.geometry =

            new THREE.BufferGeometry();

        //--------------------------------------------------

        this.generate();

        //--------------------------------------------------

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

                size:5.5,

                transparent:true,

                opacity:0.28,

                depthWrite:false,

                vertexColors:true,

                blending:

                THREE.AdditiveBlending,

                sizeAttenuation:true,

                alphaTest:0.01

            });

        this.material.toneMapped=false;

        //--------------------------------------------------

        this.points =

            new THREE.Points(

                this.geometry,

                this.material

            );

        this.points.frustumCulled=false;

        this.group.add(

            this.points

        );

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

            const p=i*3;

            //--------------------------------------

            const r=

                Math.random()

                *this.radius;

            //--------------------------------------

            const theta=

                Math.random()

                *Math.PI*2;

            //--------------------------------------

            const phi=

                Math.acos(

                    2*Math.random()-1

                );

            //--------------------------------------

            this.positions[p]=

                Math.sin(phi)

                *Math.cos(theta)

                *r;

            this.positions[p+1]=

                Math.cos(phi)

                *r*0.25;

            this.positions[p+2]=

                Math.sin(phi)

                *Math.sin(theta)

                *r;

            //--------------------------------------

            this.colors[p]=0.45;
            this.colors[p+1]=0.72;
            this.colors[p+2]=1.0;

            //--------------------------------------

            this.sizes[i]=

                2+

                Math.random()*4;

            //--------------------------------------

            this.temperature[i]=

                Math.random();

            this.density[i]=

                Math.random();

            this.life[i]=1;

        }
        //--------------------------------------------------
// Layered Gas
//--------------------------------------------------

//this.generateDiskGas();

//this.generateHaloGas();

    }
        /********************************************************
                    UPDATE
    ********************************************************/

    update(

        delta,

        gravity,

        galaxyA,

        galaxyB

    ){

        const pos = this.positions;

        const col = this.colors;

        const dt = delta;

        for(let i=0;i<this.count;i++){

            const p=i*3;

            //------------------------------------------
            // Current position
            //------------------------------------------

            const x=pos[p];
            const y=pos[p+1];
            const z=pos[p+2];

            //------------------------------------------
            // Sample gravity
            //------------------------------------------

            const force = gravity.sample(

                x,
                y,
                z,

                galaxyA,

                galaxyB

            );

            //------------------------------------------
            // Integrate velocity
            //------------------------------------------

            this.vx[i]+=force.x*dt*0.15;
            this.vy[i]+=force.y*dt*0.15;
            this.vz[i]+=force.z*dt*0.15;

            //------------------------------------------
            // Curl turbulence
            //------------------------------------------

            const swirl =

                Math.sin(

                    x*0.01 +

                    gravity.time*0.25

                ) *

                Math.cos(

                    z*0.01

                );

            this.vx[i]+=

                -z*0.00002*

                swirl;

            this.vz[i]+=

                 x*0.00002*

                 swirl;

            //------------------------------------------
            // Damping
            //------------------------------------------

            this.vx[i]*=0.996;
            this.vy[i]*=0.996;
            this.vz[i]*=0.996;

            //------------------------------------------
            // Position
            //------------------------------------------

            pos[p]+=this.vx[i];
            pos[p+1]+=this.vy[i];
            pos[p+2]+=this.vz[i];

            //------------------------------------------
            // Density estimate
            //------------------------------------------

            const r = Math.sqrt(

                pos[p]*pos[p]+

                pos[p+1]*pos[p+1]+

                pos[p+2]*pos[p+2]

            );

            this.density[i]=

                THREE.MathUtils.clamp(

                    1-r/this.radius,

                    0,

                    1

                );

            //------------------------------------------
            // Temperature
            //------------------------------------------

            this.temperature[i]+=

                this.density[i]*0.002;

            this.temperature[i]*=0.999;

            //------------------------------------------
            // Colour
            //------------------------------------------

            const heat=

                THREE.MathUtils.clamp(

                    this.temperature[i],

                    0,

                    1

                );

            col[p]=

                THREE.MathUtils.lerp(

                    0.30,

                    1.00,

                    heat

                );

            col[p+1]=

                THREE.MathUtils.lerp(

                    0.55,

                    0.82,

                    heat

                );

            col[p+2]=

                THREE.MathUtils.lerp(

                    1.00,

                    0.30,

                    heat

                );

        }

        //------------------------------------------
        // GPU Upload
        //------------------------------------------

        this.geometry.attributes.position.needsUpdate=true;

        this.geometry.attributes.color.needsUpdate=true;

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
 