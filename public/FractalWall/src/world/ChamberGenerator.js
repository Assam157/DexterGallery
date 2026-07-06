import * as THREE from 'three';
import { FractalRibs } from './FractalRibs.js';

export class ChamberGenerator
{
    constructor(material)
    {
        this.material = material;

        this.ribs =
            new FractalRibs(
                material
            );
    }

    createChamber(radius = 5)
    {
        const chamber =
            new THREE.Group();

        const shell =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    radius,
                    32,
                    32
                ),
                this.material
            );

        shell.material.side =
            THREE.BackSide;

        chamber.add(shell);

        for(let i=0;i<50;i++)
        {
            const rib =
                this.ribs.create(
                    3,
                    Math.random()*0.8+0.4
                );

            const phi =
                Math.random()*Math.PI;

            const theta =
                Math.random()*Math.PI*2;

            rib.position.set(
                Math.sin(phi)*Math.cos(theta)*radius,
                Math.cos(phi)*radius,
                Math.sin(phi)*Math.sin(theta)*radius
            );

            rib.lookAt(
                0,
                0,
                0
            );

            chamber.add(rib);
        }

        return chamber;
    }

 createTunnel(
    length = 80,
    baseRadius = 20
)
{
    const path = [];

    const segments = 120;

    for(let i=0;i<segments;i++)
    {
        const z =
            -length *
            (i/(segments-1));

        path.push(
            new THREE.Vector3(
                0,
                0,
                z
            )
        );
    }

    const curve =
        new THREE.CatmullRomCurve3(
            path
        );

    const geometry =
        new THREE.TubeGeometry(
            curve,
            segments,
            baseRadius,
            64,
            false
        );

    const pos =
        geometry.attributes.position;

    const v =
        new THREE.Vector3();

    for(let i=0;i<pos.count;i++)
    {
        v.fromBufferAttribute(
            pos,
            i
        );

        // Only expand.
        // Never create bottlenecks.

        const r =
            1.5 +
            Math.abs(
                Math.sin(
                    v.z * 0.02
                )
            ) * 0.5;

        v.x *= r;
        v.y *= r;

        pos.setXYZ(
            i,
            v.x,
            v.y,
            v.z
        );
    }

    pos.needsUpdate = true;

    geometry.computeVertexNormals();

    const tunnel =
        new THREE.Mesh(
            geometry,
            this.material
        );

    tunnel.material.side =
        THREE.BackSide;

    return tunnel;
}
}