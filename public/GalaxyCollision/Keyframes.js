/**********************************************************************
 * Keyframes.js
 *
 * Milkomeda Timeline Controller
 *
 * Controls:
 *  - Galaxy positions
 *  - Tidal distortion
 *  - Gas bridge
 *  - Collision cloud
 *  - Particle morphing
 *  - Colour blending
 *********************************************************************/

import * as THREE from
"https://unpkg.com/three@0.159.0/build/three.module.js";

export class Keyframes{

    constructor(){

        this.time = 0;

        this.maxTime = 7;

    }

    //-------------------------------------------------------------

    setTime(t){

        this.time = THREE.MathUtils.clamp(

            t,

            0,

            this.maxTime

        );

    }

    //-------------------------------------------------------------

    smooth(a,b){

        return THREE.MathUtils.smoothstep(

            this.time,

            a,

            b

        );

    }

    //-------------------------------------------------------------

    evaluate(){

        //-------------------------------------------------
        // Normalized timeline
        //-------------------------------------------------

        const p = this.time / this.maxTime;

        //-------------------------------------------------
        // Distance between galaxies
        //-------------------------------------------------

        let distance;

        if(p < 0.55){

            distance = THREE.MathUtils.lerp(

                900,

                0,

                p / 0.55

            );

        }

        else{

            distance = 0;

        }

        //-------------------------------------------------
        // Tidal stretching
        //-------------------------------------------------

        const tidal =

            this.smooth(2.4,4.3);

        //-------------------------------------------------
        // Bridge

        //-------------------------------------------------

        const bridge =

            this.smooth(3.1,4.5)

            *

            (1-this.smooth(5.8,6.8));

        //-------------------------------------------------
        // Gas cloud

        //-------------------------------------------------

        const gas =

            this.smooth(3.7,4.9)

            *

            (1-this.smooth(6.2,7));

        //-------------------------------------------------
        // Colour blend

        //-------------------------------------------------

        const colour =

            this.smooth(4.3,6.5);

        //-------------------------------------------------
        // Morph into Milkomeda

        //-------------------------------------------------

        const morph =

            this.smooth(4.8,7);

        //-------------------------------------------------
        // Collision flash

        //-------------------------------------------------

        const flash =

            Math.sin(

                this.smooth(4.0,4.8)

                *

                Math.PI

            );

        //-------------------------------------------------
        // Camera zoom factor

        //-------------------------------------------------

        const zoom =

            THREE.MathUtils.lerp(

                1,

                0.82,

                this.smooth(3.5,5)

            );

        return{

            distance,

            tidal,

            bridge,

            gas,

            colour,

            morph,

            flash,

            zoom

        };

    }

}