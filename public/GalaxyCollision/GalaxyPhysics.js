/***********************************************************************
 *
 * GalaxyPhysics.js
 *
 * Milkomeda V2
 *
 * Gravitational Interaction Engine
 *
 ***********************************************************************/

import * as THREE from "three";

import { GravityField }
from "./GravityField.js";

import { TidalField }
from "./TidalField.js";

import { DensityWave }
from "./DensityWaves.js";
export class GalaxyPhysics{

    constructor(galaxyA,galaxyB){

        this.a = galaxyA;
        this.b = galaxyB;

        //--------------------------------------------------

        // Artificial gravitational constant

        this.G = 18.0;

        //--------------------------------------------------

        // Softening avoids singularities

        this.softening = 250;

        //--------------------------------------------------

     this.time = 0;

//--------------------------------------------------

this.interactionStrength = 0;

//--------------------------------------------------
// Force modules
//--------------------------------------------------

this.gravity = new GravityField();

this.tidal = new TidalField();

this.wave = new DensityWave();

    }

    /********************************************************
                    UPDATE
    ********************************************************/

 update(delta){

    this.time += delta;

    //--------------------------------------
    // Update field modules
    //--------------------------------------

    this.gravity.update(delta);

    this.wave.update(delta);

    //--------------------------------------
    // Galaxy interaction
    //--------------------------------------

    this.applyGravity(

        this.a,

        this.b

    );

    this.applyGravity(

        this.b,

        this.a

    );

    //--------------------------------------
    // Tidal stretching
    //--------------------------------------

    this.tidal.interact(

        this.a,

        this.b

    );

    //--------------------------------------
    // Density waves
    //--------------------------------------

    this.wave.simulate(

        this.a,

        this.interactionStrength

    );

    this.wave.simulate(

        this.b,

        this.interactionStrength

    );

} 
       
    applyGravity(source,target){

        const sourcePos =
            source.object.position;

        const targetPos =
            target.object.position;

        const dx =
            targetPos.x-sourcePos.x;

        const dy =
            targetPos.y-sourcePos.y;

        const dz =
            targetPos.z-sourcePos.z;

        const distance =

            Math.sqrt(

                dx*dx+

                dy*dy+

                dz*dz

            );

        //--------------------------------------------------

        const influence =

            THREE.MathUtils.smoothstep(

                900-distance,

                0,

                900

            );

        //--------------------------------------------------

        this.interactionStrength =
            influence;

        //--------------------------------------------------

        this.applyStarField(

            source,

            target,

            influence

        );

    }

    /********************************************************
                    STAR FIELD
    ********************************************************/

    applyStarField(

        source,

        target,

        influence

    ){

        const sx =
            source.object.position.x;

        const sy =
            source.object.position.y;

        const sz =
            source.object.position.z;

        const tx =
            target.object.position.x;

        const ty =
            target.object.position.y;

        const tz =
            target.object.position.z;

        //--------------------------------------------------

        const vx = source.vx;
        const vy = source.vy;
        const vz = source.vz;

        const radius =
            source.radiusArray;

        const theta =
            source.thetaArray;

        //--------------------------------------------------

        for(

            let i=0;

            i<source.starCount;

            i++

        ){

            //------------------------------------------------

            const r =
                radius[i];

            //------------------------------------------------

            // Ignore dense core

            if(r<18)
                continue;

            //------------------------------------------------

            const angle =
                theta[i];

            //------------------------------------------------

            const px =

                sx+

                Math.cos(angle)*r;

            const py =

                sy+

                source.heightArray[i];

            const pz =

                sz+

                Math.sin(angle)*r;
                            //------------------------------------------------
            // Vector from star to companion centre
            //------------------------------------------------

          //------------------------------------------------
// GravityField sample
//------------------------------------------------

const force = this.gravity.sample(

    px,
    py,
    pz,

    source,

    target

);

//------------------------------------------------
// Apply force
//------------------------------------------------

source.addForce(

    i,

    force.x * influence,

    force.y * influence,

    force.z * influence

);
//Block Tidal//

//------------------------------------------------
// Outer disk stretches more
//------------------------------------------------

const edge =

    THREE.MathUtils.smoothstep(

        r,

        source.radius * 0.25,

        source.radius

    );

theta[i] +=

    edge *

    influence *

    0.00018;

vx[i] *= 0.996;
vy[i] *= 0.996;
vz[i] *= 0.996;
            
            //------------------------------------------------
            // Mild orbital precession
            //------------------------------------------------

            theta[i] +=

                influence *

                0.00012 *

                edge;

            //------------------------------------------------
            // Velocity damping
            //------------------------------------------------

            vx[i] *= 0.9985;
            vy[i] *= 0.9985;
            vz[i] *= 0.9985;

        }

    }

    /********************************************************
                    INTERACTION STRENGTH
    ********************************************************/

    setInteractionStrength(value){

        this.interactionStrength =

            THREE.MathUtils.clamp(

                value,

                0,

                1

            );

    }

    get strength(){

        return this.interactionStrength;

    }

}