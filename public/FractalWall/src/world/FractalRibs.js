import * as THREE from 'three';

export class FractalRibs
{
    constructor(material)
    {
        this.material = material;
    }

    create(depth = 3, scale = 1)
    {
        const root = new THREE.Group();

        this.branch(
            root,
            depth,
            scale
        );

        return root;
    }

    branch(parent, depth, scale)
    {
        if(depth <= 0) return;

        const bone =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    scale,
                    scale * 0.3,
                    scale * 0.2
                ),
                this.material
            );

        parent.add(bone);

        const count = 2 + Math.floor(
            Math.random() * 2
        );

        for(let i=0;i<count;i++)
        {
            const child =
                new THREE.Group();

            child.position.set(
                (Math.random()-0.5)*scale,
                scale*0.8,
                (Math.random()-0.5)*scale
            );

            child.rotation.z =
                (Math.random()-0.5);

            child.rotation.x =
                (Math.random()-0.5);

            parent.add(child);

            this.branch(
                child,
                depth-1,
                scale*0.65
            );
        }
    }
}