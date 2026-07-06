import * as THREE from 'three';

export function createRecursiveFogMaterial()
{
    return new THREE.ShaderMaterial({

        transparent:true,
        depthWrite:false,

        uniforms:
        {
            time:
            {
                value:0
            }
        },

        vertexShader:`

        varying vec3 vWorld;

        void main()
        {
            vec4 world=
                modelMatrix*
                vec4(position,1.0);

            vWorld=
                world.xyz;

            gl_Position=
                projectionMatrix*
                viewMatrix*
                world;
        }

        `,

        fragmentShader:`

        uniform float time;

        varying vec3 vWorld;

        void main()
        {
            float dist=
                length(vWorld);

            float fog=
                exp(
                    -dist*0.03
                );

            fog=
                pow(
                    fog,
                    4.0
                );

            fog*=
                0.9+
                sin(
                    time*0.2
                )*0.1;

            gl_FragColor=
                vec4(
                    0.0,
                    0.0,
                    0.0,
                    1.0-fog
                );
        }

        `
    });
}