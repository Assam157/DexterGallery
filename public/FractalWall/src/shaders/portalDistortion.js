import * as THREE from 'three';

export function createPortalMaterial(texture)
{
    return new THREE.ShaderMaterial({

        uniforms:
        {
            portalTexture:
            {
                value:texture
            },

            time:
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

        uniform sampler2D portalTexture;
        uniform float time;

        varying vec2 vUv;

        void main()
        {
            vec2 uv=vUv;

            uv.x+=
                sin(
                    uv.y*15.0+
                    time
                )*0.01;

            uv.y+=
                cos(
                    uv.x*20.0+
                    time
                )*0.01;

            vec4 col=
                texture2D(
                    portalTexture,
                    uv
                );

            gl_FragColor=
                col;
        }

        `
    });
}