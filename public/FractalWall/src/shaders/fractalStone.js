import * as THREE from 'three';

export function createFractalStoneMaterial()
{
    return new THREE.ShaderMaterial({

        uniforms:
        {
            time:
            {
                value:0
            }
        },

        vertexShader:`

        uniform float time;

        varying vec3 vPos;
        varying vec3 vNormal;

        float hash(vec3 p)
        {
            return fract(
                sin(
                    dot(
                        p,
                        vec3(
                            127.1,
                            311.7,
                            74.7
                        )
                    )
                )*43758.5453
            );
        }

        float noise(vec3 p)
        {
            vec3 i=floor(p);
            vec3 f=fract(p);

            float a=hash(i);
            float b=hash(i+vec3(1.0,0.0,0.0));
            float c=hash(i+vec3(0.0,1.0,0.0));
            float d=hash(i+vec3(1.0,1.0,0.0));

            vec2 u=
                f.xy*f.xy*
                (3.0-2.0*f.xy);

            return mix(
                mix(a,b,u.x),
                mix(c,d,u.x),
                u.y
            );
        }

        float fbm(vec3 p)
        {
            float v=0.0;
            float a=0.5;

            for(int i=0;i<6;i++)
            {
                v+=noise(p)*a;
                p*=2.0;
                a*=0.5;
            }

            return v;
        }

        void main()
        {
            vPos=position;
            vNormal=normal;

            vec3 p=position;

            float d=
                fbm(
                    p*2.0 +
                    time*0.05
                );

            p += normal*d*0.4;

            gl_Position=
                projectionMatrix*
                modelViewMatrix*
                vec4(p,1.0);
        }

        `,

        fragmentShader:`

        uniform float time;

        varying vec3 vPos;
        varying vec3 vNormal;

        void main()
        {
            float cracks=
                abs(
                    sin(vPos.x*20.0)
                    *
                    sin(vPos.y*20.0)
                );

            cracks=
                pow(cracks,8.0);

            vec3 base=
                vec3(
                    0.06,
                    0.06,
                    0.07
                );

            vec3 veins=
                vec3(
                    0.25,
                    0.22,
                    0.18
                );

            vec3 col=
                mix(
                    base,
                    veins,
                    cracks
                );

            float pulse=
                0.96+
                sin(
                    time*0.5
                )*0.04;

            col*=pulse;

            gl_FragColor=
                vec4(col,1.0);
        }

        `
    });
}