import * as THREE from 'three';

export function createRealityBreakPass()
{
    return new THREE.ShaderMaterial({

        uniforms:
        {
            tDiffuse:
            {
                value:null
            },

            time:
            {
                value:0
            },

            madness:
            {
                value:0
            }
        },

        vertexShader:`

        varying vec2 vUv;

        void main()
        {
            vUv=uv;

            gl_Position=
                vec4(
                    position,
                    1.0
                );
        }

        `,

        fragmentShader:`

        uniform sampler2D tDiffuse;

        uniform float time;
        uniform float madness;

        varying vec2 vUv;

        void main()
        {
            vec2 uv=vUv;

            uv.x +=
                sin(
                    uv.y*30.0+
                    time*2.0
                )
                *0.01*
                madness;

            uv.y +=
                cos(
                    uv.x*20.0+
                    time*1.5
                )
                *0.01*
                madness;

            vec4 col=
                texture2D(
                    tDiffuse,
                    uv
                );

            col.r=
                texture2D(
                    tDiffuse,
                    uv+
                    vec2(
                        0.005*
                        madness,
                        0.0
                    )
                ).r;

            col.b=
                texture2D(
                    tDiffuse,
                    uv-
                    vec2(
                        0.005*
                        madness,
                        0.0
                    )
                ).b;

            gl_FragColor=
                col;
        }

        `
    });
}