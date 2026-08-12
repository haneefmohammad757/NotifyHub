import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroCanvas3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    // Dark deep radial background color atmosphere
    scene.fog = new THREE.FogExp2(0x0b0f19, 0.002);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 45);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // transparent background

    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 3, 100); // Indigo
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xec4899, 3, 100); // Pink/Magenta
    pointLight2.position.set(-20, -10, 15);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x3b82f6, 2, 80); // Cyan/Blue
    pointLight3.position.set(0, -25, -10);
    scene.add(pointLight3);

    // 3. Interactive Particle Wave Field
    const PARTICLE_COUNT_X = 50;
    const PARTICLE_COUNT_Y = 50;
    const numParticles = PARTICLE_COUNT_X * PARTICLE_COUNT_Y;

    const positions = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);

    let i = 0;
    let j = 0;
    for (let ix = 0; ix < PARTICLE_COUNT_X; ix++) {
      for (let iy = 0; iy < PARTICLE_COUNT_Y; iy++) {
        positions[i] = ix * 2.2 - (PARTICLE_COUNT_X * 2.2) / 2; // x
        positions[i + 1] = 0; // y
        positions[i + 2] = iy * 2.2 - (PARTICLE_COUNT_Y * 2.2) / 2; // z

        scales[j] = 1;
        i += 3;
        j++;
      }
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom Particle Texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(99, 102, 241, 0.8)');
    grad.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xa5b4fc,
      size: 1.2,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystem.position.y = -12;
    particleSystem.rotation.x = 0.3;
    scene.add(particleSystem);

    // 4. Floating 3D Geometric Crystal Shards (Representing Notification Nodes)
    const shardsGroup = new THREE.Group();

    // Central Floating Crystal (Icosahedron)
    const icoGeo = new THREE.IcosahedronGeometry(7, 0);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false,
      transparent: true,
      opacity: 0.7,
    });
    const mainCrystal = new THREE.Mesh(icoGeo, icoMat);
    mainCrystal.position.set(18, 5, 0);
    shardsGroup.add(mainCrystal);

    // Wireframe Outer Shell around main crystal
    const outerWireGeo = new THREE.IcosahedronGeometry(9, 1);
    const outerWireMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const outerWire = new THREE.Mesh(outerWireGeo, outerWireMat);
    outerWire.position.set(18, 5, 0);
    shardsGroup.add(outerWire);

    // Floating Secondary Shapes (Torus, Octahedrons, Dodecahedron)
    const torusGeo = new THREE.TorusGeometry(5, 1.2, 16, 50);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      roughness: 0.3,
      metalness: 0.7,
      transparent: true,
      opacity: 0.65,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.position.set(-22, 10, -5);
    shardsGroup.add(torusMesh);

    const octGeo = new THREE.OctahedronGeometry(4);
    const octMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75,
    });
    const octMesh1 = new THREE.Mesh(octGeo, octMat);
    octMesh1.position.set(-15, -8, 5);
    shardsGroup.add(octMesh1);

    const octMesh2 = new THREE.Mesh(octGeo, octMat);
    octMesh2.position.set(24, -10, -10);
    shardsGroup.add(octMesh2);

    scene.add(shardsGroup);

    // 5. Mouse Parallax & Interactivity
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;

      mouseX = (event.clientX - windowHalfX) * 0.05;
      mouseY = (event.clientY - windowHalfY) * 0.05;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 6. Animation Loop
    let count = 0;
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      count += 0.04;

      // Update Particle Wave Positions
      const posAttr = particleGeometry.attributes.position;
      const posArray = posAttr.array;

      let pIndex = 1;
      for (let ix = 0; ix < PARTICLE_COUNT_X; ix++) {
        for (let iy = 0; iy < PARTICLE_COUNT_Y; iy++) {
          posArray[pIndex] =
            Math.sin((ix + count) * 0.3) * 2.5 + Math.sin((iy + count) * 0.5) * 2.5;
          pIndex += 3;
        }
      }
      posAttr.needsUpdate = true;

      // Smooth Camera Ease on Mouse Move
      targetX += (mouseX - targetX) * 0.05;
      targetY += (-mouseY - targetY) * 0.05;

      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(scene.position);

      // Rotate 3D Objects
      mainCrystal.rotation.x += 0.005;
      mainCrystal.rotation.y += 0.008;

      outerWire.rotation.x -= 0.003;
      outerWire.rotation.y -= 0.005;

      torusMesh.rotation.x += 0.008;
      torusMesh.rotation.z += 0.006;

      octMesh1.rotation.y += 0.01;
      octMesh1.rotation.z += 0.007;

      octMesh2.rotation.x += 0.009;

      // Gentle floating oscillation
      shardsGroup.position.y = Math.sin(count * 0.5) * 1.5;

      // Move point lights gently
      pointLight1.position.x = Math.sin(count * 0.3) * 25;
      pointLight1.position.y = Math.cos(count * 0.4) * 20;

      pointLight2.position.x = Math.cos(count * 0.3) * 25;
      pointLight2.position.z = Math.sin(count * 0.5) * 20;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Responsive Window Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      outerWireGeo.dispose();
      outerWireMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      octGeo.dispose();
      octMat.dispose();
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
        overflow: 'hidden',
      }}
    />
  );
}
