/***********************************************************************
 *
 * GalaxyRenderer.js
 *
 * Milkomeda V2
 *
 * Rendering Controller
 *
 ***********************************************************************/

import * as THREE from "three";
import { createStarMaterial }

from "./StarShaderMaterial.js";

export class GalaxyRenderer{

    constructor(galaxy){

    //----------------------------------------------------
    // Store galaxy reference
    //----------------------------------------------------

    this.galaxy = galaxy;

    //----------------------------------------------------

    this.points = galaxy.points;

    this.material = galaxy.material;

    this.points.material = this.material;

    this.geometry = galaxy.geometry;

    //----------------------------------------------------

    this.glow = 1.0;

    this.starSize = 1.0;

    this.opacity = 1.0;

    this.bloom = 1.0;

    this.visible = true;

    this.autoLOD = true;

}
    /********************************************************
                    UPDATE
    ********************************************************/

    update(camera){

        if(this.autoLOD){

            this.updateLOD(camera);

        }

        this.material.opacity = this.opacity;

        this.material.size = this.starSize;

        this.points.visible = this.visible;

    }

    /********************************************************
                    BUFFER SYNC
    ********************************************************/

    sync(){

        this.geometry.attributes.position.needsUpdate = true;

        this.geometry.attributes.color.needsUpdate = true;

    }

    /********************************************************
                    LEVEL OF DETAIL
    ********************************************************/

   updateLOD(camera){

    if(
        !camera ||
        !this.galaxy ||
        !this.galaxy.object
    ){
        return;
    }

    const distance =

        camera.position.distanceTo(

            this.galaxy.object.position

        );

    const scale =

        THREE.MathUtils.clamp(

            distance / 1200,

            0.7,

            2.2

        );

    this.material.size =

        this.starSize * scale;

}
    /********************************************************
                    STAR GLOW
    ********************************************************/

    setGlow(value){

        this.glow = value;

        this.material.opacity =

            this.opacity *

            this.glow;

    }

    /********************************************************
                    STAR SIZE
    ********************************************************/

    setStarSize(value){

        this.starSize = value;

    }

    /********************************************************
                    OPACITY
    ********************************************************/

    setOpacity(value){

        this.opacity = THREE.MathUtils.clamp(

            value,

            0,

            1

        );

    }

    /********************************************************
                    VISIBILITY
    ********************************************************/

    setVisible(value){

        this.visible = value;

    }

    /********************************************************
                    BLOOM
    ********************************************************/

    setBloom(value){

        this.bloom = value;

        this.material.toneMapped = false;

    }

    /********************************************************
                    COLOUR TEMPERATURE
    ********************************************************/

    warm(){

        this.material.color.set(0xfff1dc);

    }

    cool(){

        this.material.color.set(0xddeeff);

    }

    neutral(){

        this.material.color.set(0xffffff);

    }

    /********************************************************
                    TWINKLE
    ********************************************************/

    twinkle(time){

        this.material.opacity =

            this.opacity *

            (

                0.9 +

                Math.sin(time * 0.5) * 0.05

            );

    }

    /********************************************************
                    DISPOSE
    ********************************************************/

    dispose(){

        this.geometry.dispose();

        this.material.dispose();

    }

}