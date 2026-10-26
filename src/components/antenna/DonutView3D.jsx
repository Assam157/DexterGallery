import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const W = 760;
const H = 500;

/**
 * 3D far-field radiation donut for a linear dipole.
 *
 *   E(θ) = | (cos(kL/2·cos θ) − cos(kL/2)) / sin θ |
 *
 * Revolved about the dipole axis (z) this produces the classic
 * toroidal pattern: fat donut for L ≪ λ, half-wave shape for L = λ/2,
 * multi-lobed for L ≥ λ.
 */
export default function DonutView3D({
  frequencyMHz = 100,
  lengthM = 1.5,
  paused = false,
}) {
  const mountRef = useRef(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#08111f");

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(3.4, 2.6, 3.4);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.7;
    controls.minDistance = 2;
    controls.maxDistance = 10;

    // ── Physics: dipole far-field magnitude ────────────────────────
    const lambda = 300 / frequencyMHz; // metres
    const kL = (2 * Math.PI * lengthM) / lambda;

    const E = (theta) => {
      const s = Math.sin(theta);
      // Limit as θ→0,π is 0 — return 0 to avoid 0/0.
      if (Math.abs(s) < 1e-4) return 0;
      const num = Math.cos((kL / 2) * Math.cos(theta)) - Math.cos(kL / 2);
      return Math.abs(num / s);
    };

    // Find peak first so the normalisation works for any length.
    let peak = 0;
    for (let i = 0; i <= 180; i++) {
      const th = (i / 180) * Math.PI;
      const m = E(th);
      if (m > peak) peak = m;
    }
    if (peak < 1e-6) peak = 1;

    // ── Build the donut mesh ───────────────────────────────────────
    const SEG_T = 128;
    const SEG_P = 256;
    const RADIUS_MIN = 0.04;
    const RADIUS_MAX = 2.0;

    const positions = [];
    const colors = [];
    const indices = [];
    const c = new THREE.Color();

    for (let i = 0; i <= SEG_T; i++) {
      const theta = (i / SEG_T) * Math.PI;
      const mag = E(theta) / peak;

      for (let j = 0; j <= SEG_P; j++) {
        const phi = (j / SEG_P) * Math.PI * 2;
        const r = RADIUS_MIN + mag * RADIUS_MAX;
        const sinT = Math.sin(theta);

        positions.push(
          r * sinT * Math.cos(phi),
          r * sinT * Math.sin(phi),
          r * Math.cos(theta)
        );

        // Cyan → magenta jet-ish ramp, dim → bright.
        c.setHSL(0.55 - 0.42 * mag, 0.9, 0.25 + 0.5 * mag);
        colors.push(c.r, c.g, c.b);
      }
    }

    for (let i = 0; i < SEG_T; i++) {
      for (let j = 0; j < SEG_P; j++) {
        const a = i * (SEG_P + 1) + j;
        const b = a + SEG_P + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const donutMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      roughness: 0.35,
      metalness: 0.15,
      side: THREE.DoubleSide,
      emissive: new THREE.Color("#1a6e8a"),
      emissiveIntensity: 0.55,
    });
    const donutMesh = new THREE.Mesh(geo, donutMat);
    scene.add(donutMesh);

    // Wireframe overlay reads as "field lines".
    const wireGeo = new THREE.WireframeGeometry(geo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x56e7ff,
      transparent: true,
      opacity: 0.14,
    });
    const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
    scene.add(wireMesh);

    // Antenna rod along z.
    const rodGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.4, 16);
    const rodMat = new THREE.MeshStandardMaterial({
      color: 0x56e7ff,
      emissive: 0x1a6e8a,
      emissiveIntensity: 0.7,
      metalness: 0.4,
      roughness: 0.3,
    });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.rotation.x = Math.PI / 2; // align with z
    scene.add(rod);

    // Lights.
    scene.add(new THREE.AmbientLight(0x88ccff, 0.45));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x56e7ff, 0.7);
    rimLight.position.set(-5, -3, -4);
    scene.add(rimLight);

    // Bloom for the "energy glow".
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(W, H),
      0.75, // strength
      0.6,  // radius
      0.82  // threshold
    );
    composer.addPass(bloom);

    // ── Animation loop ────────────────────────────────────────────
    let raf = null;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!pausedRef.current) {
        wireMesh.rotation.z += 0.0015;
      }
      controls.update();
      composer.render();
    };
    animate();

    // ── Cleanup ───────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      controls.dispose();
      composer.dispose?.();
      bloom.dispose?.();
      geo.dispose();
      donutMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      rodGeo.dispose();
      rodMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [frequencyMHz, lengthM]);

  return <div ref={mountRef} className="antenna-canvas antenna-3d-mount" />;
}