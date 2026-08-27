import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

/* ────────────────────────────────────────────────────────────
   CongoConnect Landing Page — fully immersive 3D hero
   with branded aircraft flying through the terminal
   ──────────────────────────────────────────────────────────── */

const W = 120;
const H = 60;
const FLOOR_Y = -8;
const DESK_Y   = -5.5;
const WALL_Z   = 28;
const CEILING  = 12;

export default function LandingPage3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width  = mount.clientWidth || 1200;
    const height = mount.clientHeight || 600;

    /* ── Renderer ─────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    /* ── Scene + camera ────────────────────────────────────── */
    const scene  = new THREE.Scene();
    scene.background = new THREE.Color(0x060F1F);  // cc-blue-900

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 200);
    camera.position.set(0, 6, 22);
    camera.lookAt(0, 0, 0);

    /* ── Lights ────────────────────────────────────────────── */
    const ambient = new THREE.AmbientLight(0x446699, 0.5);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0x8899cc, 0x060F1F, 0.6);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffe8c0, 2.2);  // warm dawn
    sun.position.set(-12, 18, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left   = -30;
    sun.shadow.camera.right  = 30;
    sun.shadow.camera.top    = 30;
    sun.shadow.camera.bottom = -30;
    sun.shadow.camera.near   = 1;
    sun.shadow.camera.far    = 60;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x4488ff, 0.4);
    fill.position.set(10, 8, 15);
    scene.add(fill);

    const goldAccent = new THREE.PointLight(0xD4AF37, 1.5, 30);
    goldAccent.position.set(0, 3, 0);
    scene.add(goldAccent);

    /* ── Floor (polished, reflective via roughness/metalness) */
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1a2a44,
      roughness: 0.15,
      metalness: 0.6,
      envMapIntensity: 0.7,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = FLOOR_Y;
    floor.receiveShadow = true;
    scene.add(floor);

    /* ── Floor grid (subtle, for architectural feel) */
    const grid = new THREE.GridHelper(70, 20, 0x3E629B, 0x3E629B);
    grid.position.y = FLOOR_Y + 0.05;
    grid.material.transparent = true;
    grid.material.opacity = 0.25;
    scene.add(grid);

    /* ── Back wall */
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0A1A30,
      roughness: 0.8,
      metalness: 0.0,
    });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(60, 24), wallMat);
    backWall.position.set(0, FLOOR_Y + 12, -WALL_Z);
    backWall.receiveShadow = true;
    scene.add(backWall);

    /* ── Side walls */
    const sideMat = new THREE.MeshStandardMaterial({
      color: 0x081224,
      roughness: 0.9,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(28, 24), sideMat);
    leftWall.position.set(-30, FLOOR_Y + 12, 0);
    leftWall.rotation.y = Math.PI / 2;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(28, 24), sideMat);
    rightWall.position.set(30, FLOOR_Y + 12, 0);
    rightWall.rotation.y = -Math.PI / 2;
    scene.add(rightWall);

    /* ── Ceiling */
    const ceilMat = new THREE.MeshStandardMaterial({
      color: 0x0A1628,
      roughness: 0.95,
      metalness: 0.0,
      side: THREE.BackSide,
    });
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(60, 28), ceilMat);
    ceiling.position.set(0, CEILING, 0);
    ceiling.rotation.x = Math.PI / 2;
    scene.add(ceiling);

    /* ── Large windows (dawn sky) */
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xffcc88,
      emissive: 0xffaa55,
      emissiveIntensity: 0.15,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });

    const winW = 14;
    const winH = 8;
    const winY = FLOOR_Y + 6;

    for (let i = -2; i <= 2; i++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), windowMat);
      win.position.set(i * 7, winY, -WALL_Z + 0.5);
      scene.add(win);

      // Window frame
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x2a3a55,
        roughness: 0.6,
        metalness: 0.2,
      });
      const frame = new THREE.Mesh(new THREE.EdgesGeometry(new THREE.PlaneGeometry(winW, winH)), frameMat);
      frame.position.copy(win.position);
      frame.position.z += 0.06;
      scene.add(frame);
    }

    /* ── Dawn sky gradient behind windows */
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0xff8833,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const skyPlane = new THREE.Mesh(new THREE.PlaneGeometry(40, 12), skyMat);
    skyPlane.position.set(0, winY + 2, -WALL_Z + 1.5);
    scene.add(skyPlane);

    // Sun disc
    const sunDiscMat = new THREE.MeshBasicMaterial({
      color: 0xffdd88,
      transparent: true,
      opacity: 0.6,
    });
    const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(1.5, 24), sunDiscMat);
    sunDisc.position.set(-8, winY + 3.5, -WALL_Z + 1.5);
    scene.add(sunDisc);

    /* ── Light rays (god-rays) from windows */
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0xffe0a0,
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    for (let i = -2; i <= 2; i++) {
      const ray = new THREE.Mesh(new THREE.PlaneGeometry(2, 18), rayMat);
      ray.position.set(i * 7, FLOOR_Y + 9, -WALL_Z + 2);
      ray.rotation.x = 0.15;
      scene.add(ray);
    }

    /* ── Central information desk (branded) */
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x0B2545,   // cc-blue-500
      roughness: 0.3,
      metalness: 0.1,
    });
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 2.4), deskMat);
    deskTop.position.set(0, DESK_Y, 0);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    scene.add(deskTop);

    const deskLegMat = new THREE.MeshStandardMaterial({
      color: 0x2a3a55,
      roughness: 0.5,
      metalness: 0.3,
    });
    for (const lx of [-3.5, 3.5]) {
      for (const lz of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, DESK_Y - FLOOR_Y, 12), deskLegMat);
        leg.position.set(lx, (DESK_Y + FLOOR_Y) / 2, lz);
        scene.add(leg);
      }
    }

    /* ── Brand signage on desk (gold plate) */
    const signMat = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,   // gold
      roughness: 0.2,
      metalness: 0.7,
      emissive: 0xD4AF37,
      emissiveIntensity: 0.05,
    });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.6), signMat);
    sign.position.set(0, DESK_Y + 0.24, 0);
    scene.add(sign);

    // Sign text suggestion — subtle gold strip
    const signTextMat = new THREE.MeshBasicMaterial({
      color: 0x060F1F,
    });
    const signText = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.04, 0.01), signTextMat);
    signText.position.set(0, DESK_Y + 0.27, 0.01);
    scene.add(signText);

    /* ── Two small chairs (customer seating) */
    const chairMat = new THREE.MeshStandardMaterial({
      color: 0x1a2a44,
      roughness: 0.4,
      metalness: 0.1,
    });
    for (const cx of [-5.5, 5.5]) {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.2), chairMat);
      seat.position.set(cx, FLOOR_Y + 0.2, -3);
      seat.castShadow = true;
      seat.receiveShadow = true;
      scene.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.1), chairMat);
      back.position.set(cx, FLOOR_Y + 0.6, -3.6);
      back.castShadow = true;
      scene.add(back);

      const legMat2 = new THREE.MeshStandardMaterial({ color: 0x2a3a55, metalness: 0.3, roughness: 0.5 });
      for (const lx of [-0.5, 0.5]) {
        for (const lz of [-0.5, 0.5]) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8), legMat2);
          leg.position.set(cx + lx, FLOOR_Y + 0.2, -3 + lz);
          scene.add(leg);
        }
      }
    }

    /* ── Gold accent pillars */
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x0B2545,
      roughness: 0.3,
      metalness: 0.05,
    });
    for (const pz of [-WALL_Z + 3, WALL_Z - 3]) {
      for (const px of [-18, 18]) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 12, 16), pillarMat);
        pillar.position.set(px, FLOOR_Y + 6, pz);
        pillar.castShadow = true;
        scene.add(pillar);

        // Gold cap
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.15, 16), signMat);
        cap.position.set(px, FLOOR_Y + 12, pz);
        scene.add(cap);

        // Gold base
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.2, 16), signMat);
        base.position.set(px, FLOOR_Y + 0.1, pz);
        scene.add(base);
      }
    }

    /* ── Floating particles (atmosphere / dust) */
    const particleCount = 1200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 70;
      positions[i * 3 + 1] = FLOOR_Y + Math.random() * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      sizes[i] = 0.02 + Math.random() * 0.06;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMat = new THREE.PointsMaterial({
      color: 0xD4AF37,
      size: 0.05,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    /* ── Aircraft (CongoConnect branded plane) ─────────────── */
    const planeGroup = new THREE.Group();

    // Fuselage (gold tube)
    const fuselageMat = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      roughness: 0.3,
      metalness: 0.6,
    });
    const fuselage = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 3.5, 12),
      fuselageMat
    );
    fuselage.rotation.z = Math.PI / 2;
    fuselage.position.x = 0;
    fuselage.castShadow = true;
    planeGroup.add(fuselage);

    // Nose cone (dark blue)
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x0B2545,
      roughness: 0.4,
      metalness: 0.3,
    });
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 0.6, 12),
      noseMat
    );
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 1.75;
    nose.castShadow = true;
    planeGroup.add(nose);

    // Cockpit window
    const cockpitMat = new THREE.MeshStandardMaterial({
      color: 0x88CCFF,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.7,
    });
    const cockpit = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      cockpitMat
    );
    cockpit.position.set(1.55, 0.15, 0);
    cockpit.scale.set(1, 0.5, 0.8);
    planeGroup.add(cockpit);

    // Wings (dark blue with gold tips)
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x0B2545,
      roughness: 0.5,
      metalness: 0.2,
    });
    const wings = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 0.08, 0.6),
      wingMat
    );
    wings.position.set(-0.1, 0, 0);
    wings.castShadow = true;
    planeGroup.add(wings);

    // Wing tips (gold accent)
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      roughness: 0.3,
      metalness: 0.7,
    });
    for (const side of [-1, 1]) {
      const tip = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.08, 0.6),
        tipMat
      );
      tip.position.set(-2.4, 0, 0);
      planeGroup.add(tip);
    }

    // Vertical stabilizer (tail)
    const tailMat = new THREE.MeshStandardMaterial({
      color: 0x0B2545,
      roughness: 0.5,
      metalness: 0.2,
    });
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.0, 0.5),
      tailMat
    );
    tail.position.set(-1.7, 0.5, 0);
    tail.castShadow = true;
    planeGroup.add(tail);

    // Tail gold stripe
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.15, 0.5),
      tipMat
    );
    stripe.position.set(-1.7, 0.35, 0);
    planeGroup.add(stripe);

    // Horizontal stabilizers
    const stab = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.06, 0.3),
      wingMat
    );
    stab.position.set(-1.7, 0, 0);
    planeGroup.add(stab);

    // Engine pods under wings
    const engineMat = new THREE.MeshStandardMaterial({
      color: 0x1a2a44,
      roughness: 0.6,
      metalness: 0.4,
    });
    for (const side of [-1, 1]) {
      const engine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.18, 0.5, 8),
        engineMat
      );
      engine.rotation.x = Math.PI / 2;
      engine.position.set(-0.8, -0.25, side * 0.55);
      engine.castShadow = true;
      planeGroup.add(engine);

      // Engine intake ring (gold)
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xD4AF37,
        roughness: 0.3,
        metalness: 0.7,
      });
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.03, 8, 12),
        ringMat
      );
      ring.rotation.y = Math.PI / 2;
      ring.position.set(-0.8, -0.25, side * 0.55);
      planeGroup.add(ring);
    }

    planeGroup.position.set(0, 3.5, -15);
    planeGroup.rotation.y = 0.3;
    scene.add(planeGroup);

    /* ── Camera orbit state ─────────────────────────────────── */
    let targetX = 0;
    let targetY = 0.2;
    let currentX = 0;
    let currentY = 0.2;
    let raf: number;

    const easeOrbit = (t: number, target: number, current: number, speed: number) => {
      return current + (target - current) * Math.min(1, speed);
    };

    const animate = () => {
      // Gentle auto-orbit
      const t = Date.now() * 0.0001;
      targetX = Math.sin(t) * 0.04;
      targetY = 0.2 + Math.sin(t * 0.7) * 0.04;

      currentX = easeOrbit(0, targetX, currentX, 0.03);
      currentY = easeOrbit(0, targetY, currentY, 0.03);

      // Pointer influence
      camera.position.x = currentX * 22;
      camera.position.y = 6 + currentY * 6;
      camera.lookAt(0, 0.5, 0);

      // Aircraft flies in a large circle around the terminal
      const planeTime = Date.now() * 0.00015;
      const radius = 18;
      const planeY = 4 + 1.5 * Math.sin(planeTime * 2);
      planeGroup.position.x = Math.sin(planeTime) * radius;
      planeGroup.position.z = Math.cos(planeTime) * radius - 5;
      planeGroup.position.y = planeY;
      // Aircraft nose points in direction of travel
      planeGroup.rotation.y = -planeTime + Math.PI / 2;
      // Gentle banking
      planeGroup.rotation.z = 0.05 * Math.sin(planeTime * 3);

      // Subtle particle drift
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 1] += Math.sin(Date.now() * 0.0003 + i) * 0.0003;
        if (pos[i * 3 + 1] > CEILING) pos[i * 3 + 1] = FLOOR_Y + 0.5;
        if (pos[i * 3 + 1] < FLOOR_Y) pos[i * 3 + 1] = FLOOR_Y + 11.5;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Gold light pulse
      goldAccent.intensity = 1.2 + 0.4 * Math.sin(Date.now() * 0.002);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    /* ── Resize ────────────────────────────────────────────── */
    let resizeTimer: number;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const w = mount.clientWidth || 1200;
        const h = mount.clientHeight || 600;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }, 150);
    };
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setPointer({ x, y });
    });
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', () => {});
      renderer.dispose();

      floorGeo.dispose(); floorMat.dispose();
      grid.material.dispose(); grid.geometry.dispose();
      wallMat.dispose(); backWall.geometry.dispose();
      sideMat.dispose(); leftWall.geometry.dispose(); rightWall.geometry.dispose();
      ceilMat.dispose(); ceiling.geometry.dispose();
      windowMat.dispose(); skyMat.dispose(); sunDiscMat.dispose();
      rayMat.dispose();
      for (const child of scene.children) {
        if (child instanceof THREE.Mesh && child.material) {
          child.material.dispose();
          if (child.geometry) child.geometry.dispose();
        }
      }
      planeGroup.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.material) {
          child.material.dispose();
          if (child.geometry) child.geometry.dispose();
        }
      });
      particleGeo.dispose(); particleMat.dispose();
      signMat.dispose(); sign.geometry.dispose(); signTextMat.dispose(); signText.geometry.dispose();

      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh]"
      style={{ cursor: 'grab' }}
    />
  );
}
