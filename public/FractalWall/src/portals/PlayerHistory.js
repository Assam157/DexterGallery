import * as THREE from 'three';

export class PlayerHistory
{
    constructor(maxFrames = 3000)
    {
        this.maxFrames =
            maxFrames;

        this.frames = [];
    }

    record(player)
    {
        this.frames.push({
            position:
                player.position.clone(),
            quaternion:
                player.quaternion.clone()
        });

        if(
            this.frames.length >
            this.maxFrames
        )
        {
            this.frames.shift();
        }
    }

    getDelayedFrame(delayFrames)
    {
        const index =
            Math.max(
                0,
                this.frames.length -
                delayFrames
            );

        return this.frames[index];
    }
}