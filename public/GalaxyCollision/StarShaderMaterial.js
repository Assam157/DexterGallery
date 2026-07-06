 /***********************************************************************
 *
 * StarShaderMaterial.js
 *
 * Milkomeda V2
 *
 * High Quality Stellar Shader
 *
 * Part 1
 *
 ***********************************************************************/

import * as THREE from "three";

export function createStarMaterial(){

    const material = new THREE.ShaderMaterial({

        transparent:true,

        depthWrite:false,

        depthTest:true,

        vertexColors:true,

        blending:THREE.AdditiveBlending,

        toneMapped:false,

        uniforms:{

            //------------------------------------------------
            // Global Time
            //------------------------------------------------

            uTime:{
                value:0
            },

            //------------------------------------------------
            // Global Brightness
            //------------------------------------------------

            uBrightness:{
                value:1.0
            },

            //------------------------------------------------
            // Base Point Size
            //------------------------------------------------

            uSize:{
                value:1.0
            },

            //------------------------------------------------
            // Halo Strength
            //------------------------------------------------

            uHalo:{
                value:1.0
            },

            //------------------------------------------------
            // Twinkle Strength
            //------------------------------------------------

            uTwinkle:{
                value:0.08
            },

            //------------------------------------------------
            // Core Brightness
            //------------------------------------------------

            uCore:{
                value:1.3
            }

        },

/***********************************************************************
 *
 * VERTEX SHADER
 *
 ***********************************************************************/

vertexShader:`
attribute float temperature;
attribute float luminosity;
attribute float starScale;

attribute vec3 color;

varying vec3 vColor;

varying float vDepth;

varying float vTwinkle;

varying float vDistance;

uniform float uTime;

uniform float uSize;

uniform float uTwinkle;

void main(){

    //--------------------------------------------------
    // Pass colour
    //--------------------------------------------------

    vColor = color;

    //--------------------------------------------------
    // Camera space
    //--------------------------------------------------

    vec4 mvPosition =

        modelViewMatrix *

        vec4(

            position,

            1.0

        );

    //--------------------------------------------------
    // Distance
    //--------------------------------------------------

    vDepth =

        -mvPosition.z;

    vDistance =

        length(

            mvPosition.xyz

        );

    //--------------------------------------------------
    // Procedural Twinkle
    //--------------------------------------------------

    float seed =

          position.x*0.071

        + position.y*0.119

        + position.z*0.047;

    vTwinkle =

        1.0 +

        sin(

            uTime

            + seed

        )

        *uTwinkle;

    //--------------------------------------------------
    // Perspective Scaling
    //--------------------------------------------------

    float pointSize =

    uSize *

    starScale *

    luminosity *

    (340.0 /

    max(vDepth,1.0));

    //--------------------------------------------------
    // Clamp
    //--------------------------------------------------

    pointSize =

        clamp(

            pointSize,

            1.0,

            24.0

        );

    gl_PointSize =

        pointSize;

    //--------------------------------------------------

    gl_Position =

        projectionMatrix *

        mvPosition;

}

`,

/***********************************************************************
 *
 * FRAGMENT SHADER
 *
 ***********************************************************************/

fragmentShader:`

varying vec3 vColor;

varying float vDepth;

varying float vTwinkle;

varying float vDistance;

uniform float uBrightness;

uniform float uHalo;

uniform float uCore;

void main(){

    //--------------------------------------------------
    // Point Coordinates
    //--------------------------------------------------

    vec2 uv =

        gl_PointCoord

        *2.0

        -1.0;

    float r =

        length(

            uv

        );

    //--------------------------------------------------
    // Circular Sprite
    //--------------------------------------------------

    if(

        r>1.0

    ){

        discard;

    }

    //--------------------------------------------------
    // Stellar Core
    //--------------------------------------------------

    float core =

        exp(

            -22.0

            *r*r

        );

    //--------------------------------------------------
    // Stellar Disc
    //--------------------------------------------------

    float disk =

        exp(

            -4.0

            *r*r

        );

    //--------------------------------------------------
    // Soft Halo
    //--------------------------------------------------

    float halo =

        exp(

            -1.25

            *r*r

        );

    //--------------------------------------------------
    // Atmospheric Falloff
    //--------------------------------------------------

    float atmosphere =

        smoothstep(

            1.0,

            0.25,

            r

        );

    //--------------------------------------------------
    // Distance Fade
    //--------------------------------------------------

    float fade =

        clamp(

            2500.0/

            max(

                vDepth,

                1.0

            ),

            0.20,

            1.0

        );
        vec3 stellarColour =

    mix(

        vec3(1.00,0.82,0.65),

        vec3(0.62,0.80,1.00),

        temperature

    );

vec3 colour =

    stellarColour *

    disk *

    fade *

    vTwinkle *

    uBrightness;

    //--------------------------------------------------
    // Temperature Colour
    //--------------------------------------------------

    vec3 colour =

        vColor

        *

        disk

        *

        fade

        *

        vTwinkle

        *

        uBrightness;
            //--------------------------------------------------
    // White Stellar Core
    //--------------------------------------------------

    colour +=

        vec3(1.0)

        *

        core

        *

        uCore;

    //--------------------------------------------------
    // Coloured Halo
    //--------------------------------------------------

    colour +=

        vColor

        *

        halo

        *

        uHalo

        *

        0.30;

    //--------------------------------------------------
    // Outer Glow
    //--------------------------------------------------

    float outerGlow =

        exp(

            -0.55

            *r*r

        );

    colour +=

        vColor

        *

        outerGlow

        *

        0.08;

    //--------------------------------------------------
    // Limb Softening
    //--------------------------------------------------

    colour *=

        atmosphere;

    //--------------------------------------------------
    // Alpha
    //--------------------------------------------------

    float alpha =

          disk*0.75

        + halo*0.18

        + core*0.25;

    alpha *=

        fade;

    //--------------------------------------------------

    gl_FragColor =

        vec4(

            colour,

            alpha

        );

}

`

    });

    return material;

}

/***********************************************************************
 *
 * Helper Functions
 *
 ***********************************************************************/

export function setShaderTime(

    material,

    time

){

    material.uniforms.uTime.value =

        time;

}

export function setBrightness(

    material,

    value

){

    material.uniforms.uBrightness.value =

        value;

}

export function setStarSize(

    material,

    value

){

    material.uniforms.uSize.value =

        value;

}

export function setHaloStrength(

    material,

    value

){

    material.uniforms.uHalo.value =

        value;

}

export function setTwinkleStrength(

    material,

    value

){

    material.uniforms.uTwinkle.value =

        value;

}

export function setCoreStrength(

    material,

    value

){

    material.uniforms.uCore.value =

        value;

}