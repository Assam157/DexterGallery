/**********************************************************************
 * Bridge.js
 *
 * Tidal Gas Bridge
 * Milkomeda Simulation
 *
 * Creates a gaseous particle bridge between two galaxies.
 **********************************************************************/

import * as THREE from "https://unpkg.com/three@0.159.0/build/three.module.js";

export class Bridge {

    constructor({

        particles = 18000,

        width = 45,

        color = 0xddeeff

    } = {}){

        this.count = particles;

        this.width = width;

        this.color = new THREE.Color(color);

        this.progress = 0;

        this.start = new THREE.Vector3(-250,0,0);
        this.end   = new THREE.Vector3(250,0,0);

        this.positions = new Float32Array(this.count*3);
        this.colors    = new Float32Array(this.count*3);

        this.geometry = new THREE.BufferGeometry();

        this.geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                this.positions,
                3
            )
        );

        this.geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(
                this.colors,
                3
            )
        );

        this.material = new THREE.PointsMaterial({

            size:2,

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

    /*--------------------------------------------------*/

    generate(){

        for(let i=0;i<this.count;i++){

            const p=i*3;

            this.positions[p]=0;
            this.positions[p+1]=9999;
            this.positions[p+2]=0;

            this.colors[p]=this.color.r;
            this.colors[p+1]=this.color.g;
            this.colors[p+2]=this.color.b;

        }

    }

    /*--------------------------------------------------*/

    update(){

        const pos=this.geometry.attributes.position.array;

        for(let i=0;i<this.count;i++){

            const p=i*3;

            const t=Math.random();

            const x=THREE.MathUtils.lerp(

                this.start.x,

                this.end.x,

                t

            );

            const y=

                (Math.random()-0.5)

                *this.width

                *(1-this.progress)

                +

                Math.sin(t*Math.PI)

                *this.width

                *0.35;

            const z=

                (Math.random()-0.5)

                *this.width;

            const curve=

                Math.sin(

                    t*Math.PI

                )

                *40

                *this.progress;

            pos[p]=x;

            pos[p+1]=y;

            pos[p+2]=z+curve;

        }

        this.geometry.attributes.position.needsUpdate=true;

        this.material.opacity=this.progress;

    }

    /*--------------------------------------------------*/

    setEndpoints(a,b){

        this.start.copy(a);

        this.end.copy(b);

    }

    /*--------------------------------------------------*/

    setProgress(v){

        this.progress=

            THREE.MathUtils.clamp(v,0,1);

    }

    /*--------------------------------------------------*/

    get object(){

        return this.points;

    }

}