// scene.js - Three.js scene setup, camera, renderer, post-processing
// ISA-95: Line level - production line infrastructure

import { TAU } from './geometry.js';

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020210);
  scene.fog = new THREE.FogExp2(0x020210, 0.006);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 20);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.8;
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  // Lighting rig
  const ambient = new THREE.AmbientLight(0x404070, 0.6);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0x6666cc, 0x333322, 0.5);
  scene.add(hemi);

  const lights = [];
  const lightColors = [0xff0066, 0x00ffff, 0xffff00, 0x00ff88, 0xff00ff, 0x0088ff, 0xff4400, 0x44ff00];
  lightColors.forEach((c, i) => {
    const light = new THREE.PointLight(c, 2.0, 35);
    let angle = i / lightColors.length * TAU;
    light.position.set(Math.cos(angle) * 5, Math.sin(i) * 3, Math.sin(angle) * 5);
    lights.push(light);
    scene.add(light);
  });

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, lights };
}

export function animateCamera(camera, time) {
  const speed1 = time * 0.0006;
  const speed2 = time * 0.0004;
  const radius = 14 + Math.sin(time * 0.0008) * 4;
  const height = Math.sin(speed2) * 6 + Math.cos(time * 0.0003) * 2;

  camera.position.x = Math.sin(speed1) * radius;
  camera.position.z = Math.cos(speed1) * radius;
  camera.position.y = height;
  camera.lookAt(0, Math.sin(time * 0.0002) * 0.5, 0);
}

export function animateLights(lights, time) {
  lights.forEach((light, i) => {
    const a = time * 0.0018 + i / lights.length * TAU;
    const wobble = Math.sin(time * 0.003 + i * 1.5);
    light.position.x = Math.cos(a) * (5 + wobble * 2);
    light.position.z = Math.sin(a) * (5 + Math.cos(time * 0.003 + i) * 2);
    light.position.y = Math.sin(time * 0.003 + i * 0.7) * 4;
    light.intensity = 1.6 + Math.sin(time * 0.008 + i * 0.9) * 0.6;
  });
}
