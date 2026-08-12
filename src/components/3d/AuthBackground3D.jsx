import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function AuthBackground3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.003);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0x6366f1, 2.5, 60);
    light1.position.set(15, 15, 10);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xec4899, 2.5, 60);
    light2.position.set(-15, -15, 10);
    scene.add(light2);

    // Ambient Starfield / Particles
    const starCount = 600;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 120;
      starPositions[i + 1] = (Math.random() - 0.5) * 120;
      starPositions[i + 2] = (Math.random() - 0.5) * 80 - 10;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.8,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const starSystem = new THREE.Points(starGeometry, starMaterial);
    scene.add(starSystem);

    // Floating 3D Geometric Nodes
    const group = new THREE.Group();

    const geometries = [
      new THREE.IcosahedronGeometry(2.5, 0),
      new THREE.OctahedronGeometry(2, 0),
      new THREE.TetrahedronGeometry(2.2, 0),
      new THREE.TorusGeometry(2, 0.6, 12, 30),
    ];

    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.2, metalness: 0.8, transparent: true, opacity: 0.6 }),
      new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3, metalness: 0.7, transparent: true, opacity: 0.65 }),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.2, metalness: 0.8, transparent: true, opacity: 0.6 }),
    ];

    const meshes = [];
    const positionsList = [
      { x: -14, y: 8, z: -5 },
      { x: 15, y: -7, z: -2 },
      { x: -12, y: -10, z: 2 },
      { x: 14, y: 10, z: -8 },
    ];

    positionsList.forEach((pos, idx) => {
      const mesh = new THREE.Mesh(geometries[idx % geometries.length], materials[idx % materials.length]);
      mesh.position.set(pos.x, pos.y, pos.z);
      group.add(mesh);
      meshes.push(mesh);
    });

    scene.add(group);

    // Mouse tilt effect
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 4;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 4;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotate group and starfield gently
      group.rotation.y = elapsedTime * 0.08;
      starSystem.rotation.y = elapsedTime * 0.02;

      meshes.forEach((mesh, index) => {
        mesh.rotation.x += 0.005 * (index + 1);
        mesh.rotation.y += 0.008 * (index + 1);
        mesh.position.y += Math.sin(elapsedTime * 1.5 + index) * 0.01;
      });

      // Ease camera based on mouse movement
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      starGeometry.dispose();
      starMaterial.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
