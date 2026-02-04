// particles.js - Ambient particle system
// ISA-95: Cell level - environmental particles

import { TAU } from './geometry.js';

export function createParticles(scene) {
  const count = 2500;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * TAU;
    const r = 2 + Math.random() * 9;
    const h = (Math.random() - 0.5) * 18;

    positions[i * 3] = Math.cos(angle) * r;
    positions[i * 3 + 1] = h;
    positions[i * 3 + 2] = Math.sin(angle) * r;

    const hue = Math.random();
    const col = new THREE.Color().setHSL(hue, 0.85, 0.6 + Math.random() * 0.3);
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    sizes[i] = 0.02 + Math.random() * 0.04;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.06,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // Secondary dust layer - finer particles
  const dustCount = 1000;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  const dustCol = new Float32Array(dustCount * 3);

  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 20;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 20;

    const c = new THREE.Color().setHSL(0.15 + Math.random() * 0.1, 0.3, 0.8);
    dustCol[i * 3] = c.r;
    dustCol[i * 3 + 1] = c.g;
    dustCol[i * 3 + 2] = c.b;
  }

  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute('color', new THREE.BufferAttribute(dustCol, 3));

  const dustMat = new THREE.PointsMaterial({
    size: 0.025,
    vertexColors: true,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  return { particles, dust, count, dustCount };
}

export function animateParticles(particleData, time, chatEnergy = 0) {
  const { particles, dust, count, dustCount } = particleData;
  const boost = 1 + chatEnergy * 3;

  // Main particles - swirl upward
  const pos = particles.geometry.attributes.position.array;
  for (let i = 0; i < count; i++) {
    const speed = (0.008 + Math.sin(i * 0.1) * 0.004) * boost;
    pos[i * 3 + 1] += Math.sin(time * 0.008 + i * 0.02) * speed;

    // Radial oscillation - faster with chat energy
    const angle = Math.atan2(pos[i * 3 + 2], pos[i * 3]);
    const r = Math.sqrt(pos[i * 3] ** 2 + pos[i * 3 + 2] ** 2);
    const newAngle = angle + 0.0003 * boost;
    pos[i * 3] = Math.cos(newAngle) * r;
    pos[i * 3 + 2] = Math.sin(newAngle) * r;

    if (pos[i * 3 + 1] > 9) pos[i * 3 + 1] = -9;
    if (pos[i * 3 + 1] < -9) pos[i * 3 + 1] = 9;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  particles.rotation.y = time * 0.00015;

  // Dust - brownian drift
  const dPos = dust.geometry.attributes.position.array;
  for (let i = 0; i < dustCount; i++) {
    dPos[i * 3] += (Math.random() - 0.5) * 0.01;
    dPos[i * 3 + 1] += (Math.random() - 0.5) * 0.01;
    dPos[i * 3 + 2] += (Math.random() - 0.5) * 0.01;

    // Contain within bounds
    for (let j = 0; j < 3; j++) {
      if (Math.abs(dPos[i * 3 + j]) > 10) dPos[i * 3 + j] *= 0.95;
    }
  }
  dust.geometry.attributes.position.needsUpdate = true;
}
