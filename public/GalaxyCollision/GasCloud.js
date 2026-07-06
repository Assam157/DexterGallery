/**********************************************************************
 * GasCloud.js
 *
 * Milkomeda Simulation
 *
 * Expanding turbulent gas cloud formed during the collision.
 *********************************************************************/

import * as THREE from "https://unpkg.com/three@0.159.0/build/three.module.js";

export class GasCloud {

    constructor({

        particles = 22000,

        radius = 90,

        color = 0xfff1dd

    } = {}){

        this.count = particles;
        this.radius = radius;

        this.progress = 0;
        this.time = 0;

        this.center = new THREE.Vector3();

        this.baseColor = new THREE.Color(color);
        this.finalColor = new THREE.Color(0xdcb8ff);

        this.positions = new Float32Array(this.count*3);
        this.colors = new Float32Array(this.count*3);

        this.randomRadius = new Float32Array(this.count);
        this.randomTheta = new Float32Array(this.count);
        this.randomPhi = new Float32Array(this.count);

        this.geometry = new THREE.BufferGeometry();

        this.geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(this.positions,3)
        );

        this.geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(this.colors,3)
        );

        this.material = new THREE.PointsMaterial({

            size:2.4,

            vertexColors:true,

            transparent:true,

            opacity:0,

            depthWrite:false,

            blending:THREE.AdditiveBlending

        });

        this.points = new THREE.Points(
            this.geometry,
            this.material
        );

        this.generate();

    }

    /*------------------------------------------------------*/

    generate(){

        for(let i=0;i<this.count;i++){

            this.randomRadius[i]=Math.random();

            this.randomTheta[i]=Math.random()*Math.PI*2;

            this.randomPhi[i]=Math.acos(
                2*Math.random()-1
            );

            const p=i*3;

            this.positions[p]=9999;
            this.positions[p+1]=9999;
            this.positions[p+2]=9999;

            this.colors[p]=this.baseColor.r;
            this.colors[p+1]=this.baseColor.g;
            this.colors[p+2]=this.baseColor.b;

        }

    }

    /*------------------------------------------------------*/

    update(dt=1){

        this.time+=dt*0.002;

        const pos=this.geometry.attributes.position.array;
        const col=this.geometry.attributes.color.array;

        const currentRadius=

            this.radius*

            (0.25+

            this.progress*2.3);

        for(let i=0;i<this.count;i++){

            const p=i*3;

            const r=

                this.randomRadius[i]

                *currentRadius;

            const theta=

                this.randomTheta[i]

                +

                this.time

                +

                Math.sin(

                    this.time*4+

                    i*0.01

                )*0.3;

            const phi=

                this.randomPhi[i]

                +

                Math.sin(

                    this.time*2+

                    i*0.003

                )*0.15;

            const turbulence=

                1+

                Math.sin(

                    this.time*5+

                    i*0.02

                )*0.12;

            pos[p]=

                this.center.x+

                Math.sin(phi)

                *Math.cos(theta)

                *r

                *turbulence;

            pos[p+1]=

                this.center.y+

                Math.cos(phi)

                *r

                *0.45

                *turbulence;

            pos[p+2]=

                this.center.z+

                Math.sin(phi)

                *Math.sin(theta)

                *r

                *turbulence;

            const c=this.baseColor.clone();

            c.lerp(

                this.finalColor,

                this.progress

            );

            col[p]=c.r;
            col[p+1]=c.g;
            col[p+2]=c.b;

        }

        this.geometry.attributes.position.needsUpdate=true;
        this.geometry.attributes.color.needsUpdate=true;

        this.material.opacity=

            this.progress*0.9;

    }

    /*------------------------------------------------------*/

    setCenter(v){

        this.center.copy(v);

    }

    /*------------------------------------------------------*/

    setProgress(v){

        this.progress=

            THREE.MathUtils.clamp(v,0,1);

    }

    /*------------------------------------------------------*/

    get object(){

        return this.points;

    }

}