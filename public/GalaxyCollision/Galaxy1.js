 /***********************************************************************
 *
 * Galaxy.js
 * Milkomeda V2
 *
 * Part 1
 *
 * High Performance Spiral Galaxy
 *
 ***********************************************************************/

import * as THREE from "three";
import { GalaxyRenderer } from "./GalaxyRenderer.js";
import { StarPopulation }

from "./StarPopulation.js";

export class Galaxy{

    constructor({

        stars = 80000,

        radius = 180,

        coreRadius = 18,

        haloRadius = 260,

        arms = 4,

        armSpread = 0.42,

        armTightness = 0.34,

        thickness = 4,

        rotationDirection = 1,

        colorA = 0x87bfff,

        colorB = 0xffffff,

        colorC = 0xffd48a

    }={}){

        this.starCount = stars;

        this.radius = radius;

        this.coreRadius = coreRadius;

        this.haloRadius = haloRadius;

        this.armCount = arms;

        this.armSpread = armSpread;

        this.armTightness = armTightness;

        this.diskThickness = thickness;

        this.rotationDirection = rotationDirection;

        //----------------------------------------------------
        // Scene Object
        //----------------------------------------------------

        this.group = new THREE.Group();

        //----------------------------------------------------
        // GPU Buffers
        //----------------------------------------------------

        this.positions =
            new Float32Array(
                this.starCount*3
            );

        this.colors =
            new Float32Array(
                this.starCount*3
            );

        this.sizes =
            new Float32Array(
                this.starCount
            );

        //----------------------------------------------------
        // Physics Arrays
        //----------------------------------------------------

        this.radiusArray =
            new Float32Array(
                this.starCount
            );

        this.thetaArray =
            new Float32Array(
                this.starCount
            );

        this.heightArray =
            new Float32Array(
                this.starCount
            );

        this.speedArray =
            new Float32Array(
                this.starCount
            );

        this.massArray =
            new Float32Array(
                this.starCount
            );

        this.temperatureArray =
            new Float32Array(
                this.starCount
            );

        this.armArray =
            new Uint8Array(
                this.starCount
            );

        //----------------------------------------------------
        // Runtime Forces
        //----------------------------------------------------

        this.vx =
            new Float32Array(
                this.starCount
            );

        this.vy =
            new Float32Array(
                this.starCount
            );

        this.vz =
            new Float32Array(
                this.starCount
            );
            //----------------------------------------------------
// Persistent Displacement
//----------------------------------------------------

this.offsetX =
    new Float32Array(
        this.starCount
    );

this.offsetY =
    new Float32Array(
        this.starCount
    );

this.offsetZ =
    new Float32Array(
        this.starCount
    );
        //----------------------------------------------------
        // Original Colours
        //----------------------------------------------------

        this.baseColors=[];

        this.colorA=new THREE.Color(colorA);

        this.colorB=new THREE.Color(colorB);

        this.colorC=new THREE.Color(colorC);

        //----------------------------------------------------
        // Animation State
        //----------------------------------------------------

        this.mergeAmount=0;

        this.tidalStrength=0;

        this.bridgeStrength=0;

        this.time=0;

        //----------------------------------------------------
        // Generate Galaxy
        //----------------------------------------------------

         this.generate();

this.population =
    new StarPopulation(this);

if(typeof this.population.initialize==="function"){

    this.population.initialize();

}

        //----------------------------------------------------
        // Geometry
        //----------------------------------------------------

        this.geometry=
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

            )

        );

        this.geometry.computeBoundingSphere();

        //----------------------------------------------------
        // Material
        //----------------------------------------------------

        this.material=
            new THREE.PointsMaterial({

                size:1.4,

                vertexColors:true,

                transparent:true,

                opacity:1,

                alphaTest:0.01,

                depthWrite:false,

                blending:
                    THREE.AdditiveBlending,

                sizeAttenuation:true

            });

        this.material.toneMapped=false;

        //----------------------------------------------------
        // Points
        //----------------------------------------------------

        this.points=
            new THREE.Points(

                this.geometry,

                this.material

            );

        this.points.frustumCulled=false;

        this.group.add(
            this.points
        );
        this.renderer = new GalaxyRenderer(this);

    }

    /********************************************************
                    GALAXY GENERATION
    ********************************************************/

    generate(){

        const bulge =
            Math.floor(
                this.starCount*0.18
            );

        const halo =
            Math.floor(
                this.starCount*0.08
            );

        //--------------------------------------------------
        // Bulge
        //--------------------------------------------------

        let i=0;

        for(;i<bulge;i++){

            const r=
                Math.pow(
                    Math.random(),
                    2.5
                )*
                this.coreRadius;

            const theta=
                Math.random()
                *Math.PI*2;

            const phi=
                Math.acos(
                    2*Math.random()-1
                );

            this.radiusArray[i]=r;

            this.thetaArray[i]=theta;

            this.heightArray[i]=
                Math.cos(phi)*r;

            this.speedArray[i]=
                0.018/
                Math.sqrt(
                    r+2
                );

            this.armArray[i]=255;

            this.massArray[i]=
                3+
                Math.random()*2;

            this.temperatureArray[i]=
                6200;

        }

        //--------------------------------------------------
        // Disk + Spiral Arms
        //--------------------------------------------------

        for(;i<this.starCount-halo;i++){

            const arm=
                i%
                this.armCount;

            const r=
                Math.pow(
                    Math.random(),
                    1.65
                )*
                this.radius;

            const theta=

                arm*

                (Math.PI*2/
                this.armCount)

                +

                r*
                this.armTightness

                +

                (Math.random()-0.5)

                *this.armSpread;

            this.radiusArray[i]=r;

            this.thetaArray[i]=theta;

            this.heightArray[i]=

                (Math.random()-0.5)

                *this.diskThickness;

            this.speedArray[i]=

                0.04/

                Math.sqrt(r+1);

            this.armArray[i]=arm;

            this.massArray[i]=1;

            this.temperatureArray[i]=

                5000+

                Math.random()*3000;

        }

        //--------------------------------------------------
        // Halo
        //--------------------------------------------------

        for(;i<this.starCount;i++){

            const r=

                this.radius+

                Math.random()

                *(this.haloRadius-

                this.radius);

            this.radiusArray[i]=r;

            this.thetaArray[i]=

                Math.random()

                *Math.PI*2;

            this.heightArray[i]=

                (Math.random()-0.5)

                *r*0.6;

            this.speedArray[i]=

                0.01/

                Math.sqrt(r);

            this.armArray[i]=254;

            this.massArray[i]=0.5;

            this.temperatureArray[i]=4500;

        }

        //--------------------------------------------------
        // Build GPU Buffers
        //--------------------------------------------------

        this.buildBuffers();

    }
        /********************************************************
                    BUILD GPU BUFFERS
    ********************************************************/

    buildBuffers(){

        for(let i=0;i<this.starCount;i++){

            const p=i*3;

            const r=this.radiusArray[i];
            const theta=this.thetaArray[i];

            //------------------------------------------------
            // Cartesian coordinates
            //------------------------------------------------

            const x=Math.cos(theta)*r;
            const y=this.heightArray[i];
            const z=Math.sin(theta)*r;

            this.positions[p]=x;
            this.positions[p+1]=y;
            this.positions[p+2]=z;

            //------------------------------------------------
            // Star colours
            //------------------------------------------------

            let colour;

            const temp=this.temperatureArray[i];

            if(temp>7000){

                colour=this.colorA.clone();

            }
            else if(temp>5600){

                colour=this.colorB.clone();

            }
            else{

                colour=this.colorC.clone();

            }

            const brightness=
                0.75+
                Math.random()*0.45;

            colour.multiplyScalar(
                brightness
            );

            this.colors[p]=colour.r;
            this.colors[p+1]=colour.g;
            this.colors[p+2]=colour.b;

            this.baseColors[i]=colour.clone();

            //------------------------------------------------
            // Point size
            //------------------------------------------------
 

this.sizes[i]=

THREE.MathUtils.lerp(

2.8,

0.6,

r/

this.haloRadius

);

        }

    }

    /********************************************************
                    MAIN UPDATE
    ********************************************************/

     /********************************************************
                MAIN UPDATE
********************************************************/

update(delta,camera=null){

    //--------------------------------------------------
    // Simulation Clock
    //--------------------------------------------------

    this.time += delta;

    //--------------------------------------------------
    // Orbital Motion
    //--------------------------------------------------

    this.updateOrbits(delta);

    //--------------------------------------------------
    // Internal Tidal Stretch
    //--------------------------------------------------

    this.applyTidalField(delta);

    //--------------------------------------------------
    // Colour Evolution
    //--------------------------------------------------

    this.updateColours();

    //--------------------------------------------------
    // Renderer Synchronisation
    //--------------------------------------------------

    this.renderer.sync();

    //--------------------------------------------------
    // Camera LOD
    //--------------------------------------------------

    if(camera){

        this.renderer.update(camera);

    }

}

    /********************************************************
                    DIFFERENTIAL ROTATION
    ********************************************************/

    updateOrbits(delta){

        const pos=this.positions;

        const dt=delta;

        for(let i=0;i<this.starCount;i++){

            const p=i*3;

            //--------------------------------------------
            // Advance orbital angle
            //--------------------------------------------

            this.thetaArray[i]+=

                this.speedArray[i]

                *

                this.rotationDirection

                *

                dt;

            //--------------------------------------------
            // Radius
            //--------------------------------------------

            const r=this.radiusArray[i];

            //--------------------------------------------
            // Angle
            //--------------------------------------------

            const theta=this.thetaArray[i];

            //--------------------------------------------
            // Circular orbit
            //--------------------------------------------

            //--------------------------------------------------
// Integrate velocity
//--------------------------------------------------

this.offsetX[i] += this.vx[i];
this.offsetY[i] += this.vy[i];
this.offsetZ[i] += this.vz[i];

//--------------------------------------------------
// Mild restoring force
//--------------------------------------------------

this.offsetX[i] *= 0.9995;
this.offsetY[i] *= 0.9995;
this.offsetZ[i] *= 0.9995;

//--------------------------------------------------
// Final position
//--------------------------------------------------

pos[p] =

    Math.cos(theta) * r

    +

    this.offsetX[i];

pos[p+1] =

    this.heightArray[i]

    +

    this.offsetY[i];

pos[p+2] =

    Math.sin(theta) * r

    +

    this.offsetZ[i];
        }

    }

    /********************************************************
                    TIDAL DISTORTION
    ********************************************************/

    applyTidalField(delta){

        const damping=0.996;

        for(let i=0;i<this.starCount;i++){

            const angle=this.thetaArray[i];

            const r=this.radiusArray[i];

            //--------------------------------------------
            // Stronger at edge of galaxy
            //--------------------------------------------

             const edge =

THREE.MathUtils.smoothstep(

    r,

    this.radius*0.25,

    this.radius

);

            //--------------------------------------------
            // Stretch along interaction axis
            //--------------------------------------------

            const stretch=

                Math.sin(

                    angle*2

                )

                *

                edge

                *

                this.tidalStrength

                *

                0.18;

            this.vx[i]+=

                Math.cos(angle)

                *stretch;

            this.vz[i]+=

                Math.sin(angle)

                *stretch;

            //--------------------------------------------
            // Velocity damping
            //--------------------------------------------

            this.vx[i]*=damping;
            this.vy[i]*=damping;
            this.vz[i]*=damping;

        }

    }

    /********************************************************
                    STAR COLOURS
    ********************************************************/

    updateColours(){

        const col=this.colors;

        const target=

            new THREE.Color(

                0xd9bcff

            );

        for(let i=0;i<this.starCount;i++){

            const p=i*3;

            const base=this.baseColors[i];

            col[p]=THREE.MathUtils.lerp(

                base.r,

                target.r,

                this.mergeAmount

            );

            col[p+1]=THREE.MathUtils.lerp(

                base.g,

                target.g,

                this.mergeAmount

            );

            col[p+2]=THREE.MathUtils.lerp(

                base.b,

                target.b,

                this.mergeAmount

            );

        }

    }
        /********************************************************
                    MERGE CONTROL
    ********************************************************/

    setMergeAmount(value){

        this.mergeAmount = THREE.MathUtils.clamp(
            value,
            0,
            1
        );

    }

    /********************************************************
                    TIDAL CONTROL
    ********************************************************/

    setTidalStrength(value){

        this.tidalStrength = THREE.MathUtils.clamp(
            value,
            0,
            1
        );

    }

    /********************************************************
                    BRIDGE CONTROL
    ********************************************************/

    setBridgeStrength(value){

        this.bridgeStrength = THREE.MathUtils.clamp(
            value,
            0,
            1
        );

    }

    /********************************************************
                    OPACITY
    ********************************************************/

    setOpacity(value){

        this.material.opacity = THREE.MathUtils.clamp(
            value,
            0,
            1
        );

    }

    /********************************************************
                    SCALE
    ********************************************************/

    setScale(value){

        this.group.scale.setScalar(value);

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
                    TRANSLATE
    ********************************************************/

    translate(x,y,z){

        this.group.position.x += x;
        this.group.position.y += y;
        this.group.position.z += z;

    }

    /********************************************************
                    ROTATE
    ********************************************************/

    rotate(x,y,z){

        this.group.rotation.x += x;
        this.group.rotation.y += y;
        this.group.rotation.z += z;

    }

    /********************************************************
                    VISIBILITY
    ********************************************************/

    setVisible(value){

        this.group.visible = value;

    }

    /********************************************************
                    RESET VELOCITIES
    ********************************************************/

    clearVelocity(){

        this.vx.fill(0);
        this.vy.fill(0);
        this.vz.fill(0);

    }

    /********************************************************
                    WORLD POSITION
    ********************************************************/

    getWorldPosition(){

        const p = new THREE.Vector3();

        this.group.getWorldPosition(p);

        return p;

    }

    /********************************************************
                    ACCESSORS
    ********************************************************/

    get object(){

        return this.group;

    }

    get mesh(){

        return this.points;

    }

    get geometryObject(){

        return this.geometry;

    }

    get materialObject(){

        return this.material;

    }

    get starPositions(){

        return this.positions;

    }

    get starColours(){

        return this.colors;

    }

    get starSizes(){

        return this.sizes;

    }

    get orbitalRadius(){

        return this.radiusArray;

    }

    get orbitalAngle(){

        return this.thetaArray;

    }

    get orbitalVelocity(){

        return this.speedArray;

    }
    /********************************************************
        ADD EXTERNAL FORCE
********************************************************/

addForce(

    index,

    fx,

    fy,

    fz

){

    this.vx[index]+=fx;

    this.vy[index]+=fy;

    this.vz[index]+=fz;

}

    /********************************************************
                    DISPOSE
    ********************************************************/

    dispose(){

        this.geometry.dispose();

        this.material.dispose();

    }

}