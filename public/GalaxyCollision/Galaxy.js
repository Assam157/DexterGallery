/***********************************************************************
 *
 * Galaxy.js
 *
 * Milkomeda V2
 *
 * Core Galaxy Class
 *
 ***********************************************************************/

import * as THREE from "three";

import { GalaxyGenerator }
from "./GalaxyGenerator.js";

import { GalaxyRenderer }
from "./GalaxyRenderer.js";

import { StarPopulation }
from "./StarPopulation.js";

export class Galaxy{

    constructor({

        radius = 170,

        haloRadius = 360,

        coreRadius = 28,

        starCount = 90000,

        armCount = 4,

        armSpread = 0.55,

        diskThickness = 5,

        rotationSpeed = 0.00045,

        color = 0xffffff

    }={}){

        //--------------------------------------------------
        // Basic Properties
        //--------------------------------------------------

        this.radius = radius;

        this.haloRadius = haloRadius;

        this.coreRadius = coreRadius;

        this.starCount = starCount;

        this.armCount = armCount;

        this.armSpread = armSpread;

        this.diskThickness = diskThickness;

        this.rotationSpeed = rotationSpeed;

        this.baseColor =

            new THREE.Color(color);

        //--------------------------------------------------
        // Scene Graph
        //--------------------------------------------------

        this.group =

            new THREE.Group();

        //--------------------------------------------------
        // GPU Arrays
        //--------------------------------------------------

        this.positions =

            new Float32Array(

                starCount*3

            );

        this.colors =

            new Float32Array(

                starCount*3

            );

        this.sizes =

            new Float32Array(

                starCount

            );

        //--------------------------------------------------
        // Original Geometry
        //--------------------------------------------------

        this.originalPositions =

            new Float32Array(

                starCount*3

            );

        this.originalColors =

            new Float32Array(

                starCount*3

            );

        //--------------------------------------------------
        // Galaxy Structure
        //--------------------------------------------------

        this.radiusArray =

            new Float32Array(

                starCount

            );

        this.thetaArray =

            new Float32Array(

                starCount

            );

        this.heightArray =

            new Float32Array(

                starCount

            );

        this.speedArray =

            new Float32Array(

                starCount

            );

        this.massArray =

            new Float32Array(

                starCount

            );

        this.temperatureArray =

            new Float32Array(

                starCount

            );
            

        this.armArray =

            new Uint8Array(

                starCount

            );
            this.densityArray =

    new Float32Array(

        starCount

    );

for(

    let i=0;

    i<starCount;

    i++

){

    this.densityArray[i]=1.0;

}
                    //--------------------------------------------------
        // Physics Arrays
        //--------------------------------------------------

        this.vx =

            new Float32Array(

                starCount

            );

        this.vy =

            new Float32Array(

                starCount

            );

        this.vz =

            new Float32Array(

                starCount

            );

        //--------------------------------------------------
        // Local Offsets
        //--------------------------------------------------

        this.offsetX =

            new Float32Array(

                starCount

            );

        this.offsetY =

            new Float32Array(

                starCount

            );

        this.offsetZ =

            new Float32Array(

                starCount

            );

        //--------------------------------------------------
        // Geometry
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

        this.geometry.setAttribute(

            "size",

            new THREE.BufferAttribute(

                this.sizes,

                1

            ).setUsage(

                THREE.DynamicDrawUsage

            )

        );

        //--------------------------------------------------
        // Material
        //--------------------------------------------------

        this.material =

            new THREE.PointsMaterial({

                size:1.6,

                vertexColors:true,

                transparent:true,

                opacity:1.0,

                depthWrite:false,

                blending:

                THREE.AdditiveBlending,

                sizeAttenuation:true

            });

        this.material.toneMapped = false;

        //--------------------------------------------------
        // Points
        //--------------------------------------------------

        this.points =

            new THREE.Points(

                this.geometry,

                this.material

            );

        this.points.frustumCulled = false;

        this.group.add(

            this.points

        );

        //--------------------------------------------------
        // Generator
        //--------------------------------------------------

        this.generator =

            new GalaxyGenerator(

                this

            );

        this.generator.generate();

        //--------------------------------------------------
        // Stellar Population
        //--------------------------------------------------

        this.population =

            new StarPopulation(

                this

            );

        this.population.initialize();

        //--------------------------------------------------
        // Renderer
        //--------------------------------------------------

        this.renderer =

            new GalaxyRenderer(

                this

            );

        //--------------------------------------------------
        // Build Initial GPU Buffers
        //--------------------------------------------------

        this.buildBuffers();

    }
        /********************************************************
                    BUILD GPU BUFFERS
    ********************************************************/

    buildBuffers(){

        const pos = this.positions;

        const col = this.colors;

        const size = this.sizes;

        for(

            let i=0;

            i<this.starCount;

            i++

        ){

            const p = i*3;

            //------------------------------------------
            // Galaxy coordinates
            //------------------------------------------

            const r =

                this.radiusArray[i];

            const theta =

                this.thetaArray[i];

            //------------------------------------------
            // Position
            //------------------------------------------

            const x =

                Math.cos(theta)

                * r

                +

                this.offsetX[i];

            const y =

                this.heightArray[i]

                +

                this.offsetY[i];

            const z =

                Math.sin(theta)

                * r

                +

                this.offsetZ[i];

            pos[p]   = x;
            pos[p+1] = y;
            pos[p+2] = z;

            //------------------------------------------
            // Preserve original galaxy
            //------------------------------------------

            this.originalPositions[p]   = x;
            this.originalPositions[p+1] = y;
            this.originalPositions[p+2] = z;

            //------------------------------------------
            // Temperature colour
            //------------------------------------------

            const heat =

                THREE.MathUtils.clamp(

                    (this.temperatureArray[i]-3500.0)

                    /6500.0,

                    0,

                    1

                );

            const c =

                new THREE.Color();

            c.setHSL(

                THREE.MathUtils.lerp(

                    0.60,

                    0.05,

                    heat

                ),

                0.85,

                THREE.MathUtils.lerp(

                    0.72,

                    0.95,

                    heat

                )

            );

            col[p]   = c.r;
            col[p+1] = c.g;
            col[p+2] = c.b;

            //------------------------------------------
            // Preserve original colour
            //------------------------------------------

            this.originalColors[p]   = c.r;
            this.originalColors[p+1] = c.g;
            this.originalColors[p+2] = c.b;

            //------------------------------------------
            // Star size
            //------------------------------------------

            size[i] =

                THREE.MathUtils.lerp(

                    2.8,

                    0.6,

                    r/this.haloRadius

                );

        }

        //----------------------------------------------
        // Upload GPU
        //----------------------------------------------

        this.geometry.attributes.position.needsUpdate=true;

        this.geometry.attributes.color.needsUpdate=true;

        this.geometry.attributes.size.needsUpdate=true;

    }

    /********************************************************
                    ADD FORCE
    ********************************************************/

    addForce(

        index,

        fx,

        fy,

        fz

    ){

        this.vx[index] += fx;

        this.vy[index] += fy;

        this.vz[index] += fz;

    }
    /********************************************************
                INTEGRATE
********************************************************/

integrate(delta){

    for(let i=0;i<this.starCount;i++){

        this.offsetX[i]+=this.vx[i]*delta;
        this.offsetY[i]+=this.vy[i]*delta;
        this.offsetZ[i]+=this.vz[i]*delta;

        this.vx[i]*=0.995;
        this.vy[i]*=0.995;
        this.vz[i]*=0.995;

        this.thetaArray[i]+=

            this.speedArray[i]*delta;

    }

}

/********************************************************
                UPDATE
********************************************************/

update(

    delta,

    camera=null

){

    this.group.rotation.y+=

        this.rotationSpeed*delta;

    this.integrate(delta);

    this.buildBuffers();

    if(this.renderer){

        if(camera){

            this.renderer.update(camera);

        }

        this.renderer.sync();

    }

    if(this.population){

        this.population.update();

    }

}
        /********************************************************
                    BUILD GPU BUFFERS
    ********************************************************/

    

    /********************************************************
                    ADD FORCE
    ********************************************************/

     /********************************************************
                    OPACITY
    ********************************************************/

    setOpacity(value){

        this.material.opacity =

            THREE.MathUtils.clamp(

                value,

                0,

                1

            );

    }

    /********************************************************
                    STAR SIZE
    ********************************************************/

    setStarSize(value){

        this.renderer.setStarSize(

            value

        );

    }

    /********************************************************
                    VISIBILITY
    ********************************************************/

    setVisible(value){

        this.group.visible = value;

    }

    /********************************************************
                    RESET OFFSETS
    ********************************************************/

    resetOffsets(){

        this.offsetX.fill(0);

        this.offsetY.fill(0);

        this.offsetZ.fill(0);

        this.vx.fill(0);

        this.vy.fill(0);

        this.vz.fill(0);

    }

    /********************************************************
                    RESET GALAXY
    ********************************************************/

    reset(){

        this.resetOffsets();
        this.densityArray.fill(1.0);

        for(

            let i=0;

            i<this.starCount;

            i++

        ){

            this.thetaArray[i] =

                this.thetaArray[i] %

                (Math.PI*2);

        }

        this.buildBuffers();

    }

    /********************************************************
                    OBJECT
    ********************************************************/

    get object(){

        return this.group;

    }
    /********************************************************
                POSITION
********************************************************/

setPosition(x,y,z){

    this.group.position.set(

        x,

        y,

        z

    );

}

/********************************************************
                ROTATION
********************************************************/

setRotation(x,y,z){

    this.group.rotation.set(

        x,

        y,

        z

    );

}

    /********************************************************
                    DISPOSE
    ********************************************************/

    dispose(){

        if(this.renderer){

            this.renderer.dispose();

        }

        if(this.geometry){

            this.geometry.dispose();

        }

        if(this.material){

            this.material.dispose();

        }

    }

}