 import * as THREE from 'three';

export class CrawlController
{
    constructor(camera, domElement)
    {
        this.camera = camera;
        this.domElement = domElement;

        this.enabled = false;

        this.pitch = 0;
        this.yaw = 0;

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        this.velocity =
            new THREE.Vector3();

        this.crawlHeight = 0.45;

        this.speed = 2.0;

        this.breathAmplitude = 0.015;
        this.breathFrequency = 3.0;

        this.gravityUp =
            new THREE.Vector3(
                0,
                1,
                0
            );

        this.playerObject =
            new THREE.Object3D();

        this.playerObject.position.set(
            0,
            this.crawlHeight,
            0
        );

        this.playerObject.add(
            camera
        );

        camera.position.set(
            0,
            0,
            0
        );

        // ----------------------------
        // Collision Settings
        // ----------------------------

        this.playerRadius = 0.3;

        // Matches your tunnel radius
        // createTunnel(..., 2.5)

        this.tunnelRadius = 2.3;

        this.initInput();
    }

    initInput()
    {
        this.domElement.addEventListener(
            'click',
            () =>
            {
                this.domElement
                    .requestPointerLock();
            }
        );

        document.addEventListener(
            'pointerlockchange',
            () =>
            {
                this.enabled =
                    document.pointerLockElement ===
                    this.domElement;
            }
        );

        document.addEventListener(
            'mousemove',
            e =>
            {
                if(!this.enabled)
                    return;

                this.yaw -=
                    e.movementX *
                    0.002;

                this.pitch -=
                    e.movementY *
                    0.002;

                this.pitch =
                    Math.max(
                        -Math.PI/2,
                        Math.min(
                            Math.PI/2,
                            this.pitch
                        )
                    );
            }
        );

        document.addEventListener(
            'keydown',
            e =>
            {
                switch(e.code)
                {
                    case 'KeyW':
                        this.moveForward = true;
                        break;

                    case 'KeyS':
                        this.moveBackward = true;
                        break;

                    case 'KeyA':
                        this.moveLeft = true;
                        break;

                    case 'KeyD':
                        this.moveRight = true;
                        break;
                }
            }
        );

        document.addEventListener(
            'keyup',
            e =>
            {
                switch(e.code)
                {
                    case 'KeyW':
                        this.moveForward = false;
                        break;

                    case 'KeyS':
                        this.moveBackward = false;
                        break;

                    case 'KeyA':
                        this.moveLeft = false;
                        break;

                    case 'KeyD':
                        this.moveRight = false;
                        break;
                }
            }
        );
    }

    update(delta, elapsedTime)
    {
        const moveDir =
            new THREE.Vector3();

        if(this.moveForward)
            moveDir.z -= 1;

        if(this.moveBackward)
            moveDir.z += 1;

        if(this.moveLeft)
            moveDir.x -= 1;

        if(this.moveRight)
            moveDir.x += 1;

        moveDir.normalize();

        const yawQuat =
            new THREE.Quaternion()
                .setFromAxisAngle(
                    this.gravityUp,
                    this.yaw
                );

        moveDir.applyQuaternion(
            yawQuat
        );

        const nextPos =
            this.playerObject.position.clone();

        nextPos.addScaledVector(
            moveDir,
            this.speed * delta
        );

        // --------------------------------
        // Crawl Tunnel Constraints
        // --------------------------------

        nextPos.y =
            this.crawlHeight;

        const radialDistance =
            Math.sqrt(
                nextPos.x * nextPos.x +
                nextPos.y * nextPos.y
            );

        const allowedRadius =
            this.tunnelRadius -
            this.playerRadius;

        if(
            radialDistance <
            allowedRadius
        )
        {
            this.playerObject.position.copy(
                nextPos
            );
        }

        // --------------------------------
        // Rotation
        // --------------------------------

        this.playerObject.quaternion.copy(
            yawQuat
        );

        const pitchQuat =
            new THREE.Quaternion()
                .setFromAxisAngle(
                    new THREE.Vector3(
                        1,
                        0,
                        0
                    ),
                    this.pitch
                );

        this.camera.quaternion.copy(
            pitchQuat
        );

        // --------------------------------
        // Breathing
        // --------------------------------

        const breath =
            Math.sin(
                elapsedTime *
                this.breathFrequency
            ) *
            this.breathAmplitude;

        this.camera.position.y =
            breath;
    }

    setGravityFrame(upVector)
    {
        this.gravityUp.copy(
            upVector
        );
    }

    getObject()
    {
        return this.playerObject;
    }

    getPosition()
    {
        return this.playerObject.position;
    }

    getForwardVector()
    {
        const forward =
            new THREE.Vector3(
                0,
                0,
                -1
            );

        forward.applyQuaternion(
            this.playerObject.quaternion
        );

        return forward;
    }
}