/**********************************************************************
 * ParticleMorph.js
 *
 * Milkomeda Simulation
 *
 * Morphs a Galaxy from a spiral disk into an elliptical remnant.
 *********************************************************************/

import * as THREE from "https://unpkg.com/three@0.159.0/build/three.module.js";

export class ParticleMorph {

    constructor(galaxy){

        this.galaxy = galaxy;

        this.progress = 0;

        this.targetPositions = new Float32Array(

            galaxy.starCount * 3

        );

        this.createTargets();

    }

    /*----------------------------------------------------------*/

    createTargets(){

        for(let i=0;i<this.galaxy.starCount;i++){

            const p=i*3;

            // Random elliptical coordinates

            const r =
                Math.pow(Math.random(),0.55)
                * this.galaxy.radius
                * 1.45;

            const theta =
                Math.random()*Math.PI*2;

            const phi =
                Math.acos(
                    2*Math.random()-1
                );

            const flatten = 0.65;

            this.targetPositions[p] =

                Math.sin(phi)
                * Math.cos(theta)
                * r;

            this.targetPositions[p+1] =

                Math.cos(phi)
                * r
                * flatten;

            this.targetPositions[p+2] =

                Math.sin(phi)
                * Math.sin(theta)
                * r;

        }

    }

    /*----------------------------------------------------------*/

    update(){

        const pos =
            this.galaxy.geometry
            .attributes.position.array;

        const original =
            this.galaxy.originalPositions;

        const t =
            THREE.MathUtils.smoothstep(
                this.progress,
                0,
                1
            );

        for(let i=0;i<this.galaxy.starCount;i++){

            const p=i*3;

            pos[p]=THREE.MathUtils.lerp(

                original[p],

                this.targetPositions[p],

                t

            );

            pos[p+1]=THREE.MathUtils.lerp(

                original[p+1],

                this.targetPositions[p+1],

                t

            );

            pos[p+2]=THREE.MathUtils.lerp(

                original[p+2],

                this.targetPositions[p+2],

                t

            );

        }

        this.galaxy.geometry
            .attributes.position
            .needsUpdate = true;

    }

    /*----------------------------------------------------------*/

    setProgress(v){

        this.progress =

            THREE.MathUtils.clamp(
                v,
                0,
                1
            );

    }

}