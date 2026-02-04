// mirrors.js - Infinity mirror system with reflections
// ISA-95: Cell level - reflective containment unit

import { TAU } from './geometry.js';

export function createMirrors(scene) {
  const mirrorGroup = new THREE.Group();
  scene.add(mirrorGroup);

  const cubeRT = new THREE.WebGLCubeRenderTarget(512, {
    format: THREE.RGBAFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter
  });
  const cubeCam = new THREE.CubeCamera(0.1, 100, cubeRT);
  scene.add(cubeCam);

  // Hexagonal infinity mirror cage
  const mirrorCount = 8;
  const mirrors = [];
  for (let i = 0; i < mirrorCount; i++) {
    let a = i / mirrorCount * TAU;
    const geo = new THREE.PlaneGeometry(28, 28);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0a0a1a,
      metalness: 0.97,
      roughness: 0.03,
      envMap: cubeRT.texture,
      envMapIntensity: 1.5,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.set(0, a + Math.PI / 2, 0);
    mesh.position.set(Math.cos(a) * 11, 0, Math.sin(a) * 11);
    mirrors.push(mesh);
    mirrorGroup.add(mesh);
  }

  // Top and bottom mirror caps
  [{r: {x: Math.PI / 2, y: 0, z: 0}, p: {x: 0, y: 9, z: 0}},
   {r: {x: -Math.PI / 2, y: 0, z: 0}, p: {x: 0, y: -9, z: 0}}].forEach(d => {
    const geo = new THREE.CircleGeometry(11, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x080818,
      metalness: 0.98,
      roughness: 0.02,
      envMap: cubeRT.texture,
      envMapIntensity: 1.8,
      side: THREE.DoubleSide
    });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.set(d.r.x, d.r.y, d.r.z);
    m.position.set(d.p.x, d.p.y, d.p.z);
    mirrors.push(m);
    mirrorGroup.add(m);
  });

  // Central crystal
  const crystalGeo = new THREE.IcosahedronGeometry(1.8, 3);
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.05,
    roughness: 0,
    transmission: 0.95,
    thickness: 1.5,
    envMap: cubeRT.texture,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    ior: 2.33,
    reflectivity: 0.9
  });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  scene.add(crystal);

  // Inner ring of smaller crystals
  const innerCrystals = [];
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * TAU;
    const geo = new THREE.OctahedronGeometry(0.4, 1);
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color().setHSL(i / 5, 0.8, 0.6),
      metalness: 0.3,
      roughness: 0.1,
      transmission: 0.7,
      thickness: 0.5,
      envMap: cubeRT.texture,
      clearcoat: 1,
      emissive: new THREE.Color().setHSL(i / 5, 0.9, 0.15),
      emissiveIntensity: 0.8
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(Math.cos(a) * 3, 0, Math.sin(a) * 3);
    innerCrystals.push(mesh);
    scene.add(mesh);
  }

  return { mirrorGroup, cubeCam, cubeRT, crystal, innerCrystals, mirrors };
}

export function animateMirrors(mirrorData, time, renderer, scene) {
  const { mirrorGroup, cubeCam, crystal, innerCrystals } = mirrorData;

  // Crystal spin + breathe
  crystal.rotation.x = time * 0.0015;
  crystal.rotation.y = time * 0.0025;
  crystal.rotation.z = Math.sin(time * 0.001) * 0.3;
  crystal.scale.setScalar(1 + Math.sin(time * 0.008) * 0.12);

  // Update reflections
  crystal.visible = false;
  cubeCam.position.copy(crystal.position);
  cubeCam.update(renderer, scene);
  crystal.visible = true;

  // Inner crystal orbit
  innerCrystals.forEach((c, i) => {
    const a = time * 0.001 + i / 5 * TAU;
    const r = 3 + Math.sin(time * 0.002 + i) * 0.5;
    c.position.set(Math.cos(a) * r, Math.sin(time * 0.003 + i * 1.2) * 1.5, Math.sin(a) * r);
    c.rotation.x = time * 0.003 + i;
    c.rotation.y = time * 0.004 + i * 0.5;
  });

  // Slow mirror cage rotation
  mirrorGroup.rotation.y = time * 0.00008;
  mirrorGroup.rotation.x = Math.sin(time * 0.0002) * 0.02;
}
