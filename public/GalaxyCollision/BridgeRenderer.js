 /***********************************************************************
 *
 * BridgeRenderer.js
 *
 * Milkomeda V2
 *
 * Highlights the tidal bridge between galaxies
 *
 ***********************************************************************/

import * as THREE from "three";

export class BridgeRenderer{

    constructor(){

        //--------------------------------------------------

        this.bridgeStrength = 0;

        this.threshold = 35;

        this.highlightColor = new THREE.Color(

            0xe6d6ff

        );

        this.starBoost = 1.45;

        this.gasBoost = 1.65;

        this.fade = 0.985;

    }
     /********************************************************
                APPLY FLOW
********************************************************/

applyFlow(

    galaxyA,

    galaxyB

){

    const flow = this.bridgeStrength * 0.12;

    this.flowGalaxy(

        galaxyA,

        galaxyB,

        flow

    );

    this.flowGalaxy(

        galaxyB,

        galaxyA,

        flow

    );

}

/********************************************************
                FLOW GALAXY
********************************************************/

flowGalaxy(

    source,

    target,

    strength

){

    const sx = source.object.position.x;
    const sy = source.object.position.y;
    const sz = source.object.position.z;

    const tx = target.object.position.x;
    const ty = target.object.position.y;
    const tz = target.object.position.z;

    const dx = tx - sx;
    const dy = ty - sy;
    const dz = tz - sz;

    const len = Math.sqrt(

        dx*dx +

        dy*dy +

        dz*dz

    ) + 0.0001;

    const nx = dx/len;
    const ny = dy/len;
    const nz = dz/len;

    for(

        let i=0;

        i<source.starCount;

        i++

    ){

        if(source.radiusArray[i] < source.radius*0.55)

            continue;

        source.offsetX[i] += nx * strength;
        source.offsetY[i] += ny * strength;
        source.offsetZ[i] += nz * strength;

    }

}

/********************************************************
                SHOCK FRONT
********************************************************/

shockFront(

    gas

){

    if(!gas) return;

    const col = gas.colors;

    const density = gas.density;

    for(

        let i=0;

        i<gas.count;

        i++

    ){

        const p = i*3;

        const shock =

            density[i] *

            this.bridgeStrength;

        col[p] = THREE.MathUtils.lerp(

            col[p],

            1.0,

            shock*0.25

        );

        col[p+1] = THREE.MathUtils.lerp(

            col[p+1],

            0.85,

            shock*0.25

        );

        col[p+2] = THREE.MathUtils.lerp(

            col[p+2],

            1.0,

            shock*0.25

        );

    }

    gas.geometry.attributes.color.needsUpdate = true;

}
 

    /********************************************************
                        UPDATE
    ********************************************************/

    update(

        galaxyA,

        galaxyB,

        gas,

        mergerStrength

    ){

        this.bridgeStrength = mergerStrength;

        this.highlightGalaxy(

            galaxyA

        );

        this.highlightGalaxy(

            galaxyB

        );

        this.highlightGas(

            gas

        );

    }

    /********************************************************
                    GALAXY STARS
    ********************************************************/

    highlightGalaxy(

        galaxy

    ){

        const colours =

            galaxy.colors;

        const offsetsX =

            galaxy.offsetX;

        const offsetsY =

            galaxy.offsetY;

        const offsetsZ =

            galaxy.offsetZ;

        for(

            let i=0;

            i<galaxy.starCount;

            i++

        ){

            const p=i*3;

            //------------------------------------------
            // Total displacement
            //------------------------------------------

            const d = Math.sqrt(

                offsetsX[i]*offsetsX[i]+

                offsetsY[i]*offsetsY[i]+

                offsetsZ[i]*offsetsZ[i]

            );

            //------------------------------------------
            // Bridge candidate
            //------------------------------------------

            if(

                d>

                this.threshold

            ){

                const blend =

                    THREE.MathUtils.clamp(

                        (d-this.threshold)/80,

                        0,

                        1

                    )

                    *

                    this.bridgeStrength;

                colours[p]=THREE.MathUtils.lerp(

                    colours[p],

                    this.highlightColor.r,

                    blend

                );

                colours[p+1]=THREE.MathUtils.lerp(

                    colours[p+1],

                    this.highlightColor.g,

                    blend

                );

                colours[p+2]=THREE.MathUtils.lerp(

                    colours[p+2],

                    this.highlightColor.b,

                    blend

                );

            }

        }

    }

    /********************************************************
                    GAS
    ********************************************************/

    highlightGas(

        gas

    ){

        const col =

            gas.colors;

        for(

            let i=0;

            i<gas.count;

            i++

        ){

            const p=i*3;

            const glow =

                gas.density[i]

                *

                this.bridgeStrength;

            col[p]=THREE.MathUtils.lerp(

                col[p],

                1.0,

                glow*0.45

            );

            col[p+1]=THREE.MathUtils.lerp(

                col[p+1],

                0.92,

                glow*0.45

            );

            col[p+2]=THREE.MathUtils.lerp(

                col[p+2],

                1.0,

                glow*0.45

            );

        }

        gas.geometry.attributes.color.needsUpdate=true;

    }
update(

    galaxyA,

    galaxyB,

    gas,

    mergerStrength

){

    this.bridgeStrength = mergerStrength;

    //--------------------------------------

    this.highlightGalaxy(

        galaxyA

    );

    this.highlightGalaxy(

        galaxyB

    );

    //--------------------------------------

    this.highlightGas(

        gas

    );

    //--------------------------------------

    this.applyFlow(

        galaxyA,

        galaxyB

    );

    //--------------------------------------

    this.shockFront(

        gas

    );

}
}
