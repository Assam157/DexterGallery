 import * as THREE from 'three';
import { ChamberGenerator }
from './ChamberGenerator.js';

export class TunnelGraph
{
    constructor(scene, material)
    {
        this.scene = scene;

        this.generator =
            new ChamberGenerator(
                material
            );

        this.sections = [];

        this.sectionLength = 80;

        this.sectionCount = 8;

        this.build();
    }

    build()
    {
        let z = 0;

        for(
            let i=0;
            i<this.sectionCount;
            i++
        )
        {
            const tunnel =
                this.generator.createTunnel(
                    this.sectionLength,
                    3
                );

            tunnel.position.z =
                z;

            this.scene.add(
                tunnel
            );

            this.sections.push(
                tunnel
            );

            z -=
                this.sectionLength;
        }
    }

    update(player)
    {
        const playerZ =
            player.position.z;

        let lowestZ =
            Infinity;

        for(
            const section
            of this.sections
        )
        {
            lowestZ =
                Math.min(
                    lowestZ,
                    section.position.z
                );
        }

        for(
            const section
            of this.sections
        )
        {
            if(
                playerZ <
                section.position.z - 100
            )
            {
                section.position.z =
                    lowestZ -
                    this.sectionLength;

                lowestZ =
                    section.position.z;
            }
        }
    }
}