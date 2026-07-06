import * as THREE from 'three';

import { ShaderPass }
from 'three/addons/postprocessing/ShaderPass.js';

export class RealityBreakPass
{
    constructor()
    {
        this.pass =
            new ShaderPass({

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
                        projectionMatrix*
                        modelViewMatrix*
                        vec4(position,1.0);
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

                    uv.x+=
                        sin(
                            uv.y*25.0+
                            time
                        )
                        *0.01*
                        madness;

                    uv.y+=
                        cos(
                            uv.x*25.0+
                            time
                        )
                        *0.01*
                        madness;

                    vec4 col=
                        texture2D(
                            tDiffuse,
                            uv
                        );

                    gl_FragColor=
                        col;
                }

                `
            });
    }

    update(
        elapsed,
        madness
    )
    {
        this.pass.uniforms.time.value =
            elapsed;

        this.pass.uniforms.madness.value =
            madness;
    }
}