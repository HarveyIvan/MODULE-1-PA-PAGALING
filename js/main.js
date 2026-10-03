import * as THREE from 'three';
import { OrbitControls } from '../vendor/three/OrbitControls.js';

// Everything in this room is constructed from built-in geometries.
const scene = new THREE.Scene();
scene.background = new THREE.Color('#e7ede7');
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('roomCanvas'), antialias: true });
} catch (error) {
  const message = document.getElementById('errorMessage');
  message.hidden = false;
  message.textContent = 'This room needs WebGL 2. Enable hardware acceleration and reload.';
  throw error;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 12;
controls.maxDistance = 70;
controls.minPolarAngle = 0.35;
controls.maxPolarAngle = 1.4;
controls.minAzimuthAngle = -0.25;
controls.maxAzimuthAngle = 1.35;
controls.target.set(0, 1, 0);

const materials = {};
function material(color, roughness = 0.8) {
  const key = `${color}/${roughness}`;
  return materials[key] ||= new THREE.MeshStandardMaterial({ color, roughness });
}
const colors = { wood: '#b7794e', lightWood: '#dca776', cream: '#f5ead9', teal: '#357c7b', pink: '#c77458', dark: '#354b4a', sage: '#a1b394' };
function group(name, x = 0, y = 0, z = 0) {
  const result = new THREE.Group(); result.name = name; result.position.set(x, y, z); scene.add(result); return result;
}
function mesh(geometry, color, parent, x, y, z) {
  const object = new THREE.Mesh(geometry, material(color));
  object.position.set(x, y, z); object.castShadow = true; object.receiveShadow = true; parent.add(object); return object;
}
function box(parent, width, height, depth, color, x, y, z) {
  return mesh(new THREE.BoxGeometry(width, height, depth), color, parent, x, y, z);
}
function cylinder(parent, top, bottom, height, color, x, y, z) {
  return mesh(new THREE.CylinderGeometry(top, bottom, height, 24), color, parent, x, y, z);
}
function sphere(parent, radius, color, x, y, z, scale = [1, 1, 1]) {
  const object = mesh(new THREE.SphereGeometry(radius, 20, 12), color, parent, x, y, z); object.scale.set(...scale); return object;
}

// Soft daylight, shadows, and an optional warm bedside light.
scene.add(new THREE.HemisphereLight('#fff3dc', '#87938d', 2.6));
const sunlight = new THREE.DirectionalLight('#ffe5bb', 3.2);
sunlight.position.set(3, 9, 5); sunlight.castShadow = true;
sunlight.shadow.mapSize.set(2048, 2048);
Object.assign(sunlight.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 0.5, far: 25 });
sunlight.shadow.normalBias = 0.04; scene.add(sunlight);

// Open front and right side make the whole bedroom visible.
const architecture = group('Room architecture');
box(architecture, 10.3, 0.3, 8.3, colors.wood, 0, -0.2, 0);
for (let row = 0; row < 16; row++) {
  for (let column = 0; column < 5; column++) {
    box(architecture, 1.985, 0.07, 0.485, row % 2 ? '#d8ae85' : '#dfb992', -4 + column * 2, -0.015, -3.75 + row * 0.5);
  }
}
box(architecture, 0.18, 4.1, 8, colors.sage, -5, 2, 0);
box(architecture, 5.3, 4.1, 0.18, colors.cream, -2.35, 2, -4);
box(architecture, 4.7, 1.35, 0.18, colors.cream, 2.65, 0.625, -4);
box(architecture, 4.7, 0.65, 0.18, colors.cream, 2.65, 3.725, -4);
box(architecture, 0.65, 2.1, 0.18, colors.cream, 4.675, 2.35, -4);
box(architecture, 0.12, 0.18, 8, '#e8dac3', -4.87, 0.1, 0);
box(architecture, 10, 0.18, 0.12, '#e8dac3', 0, 0.1, -3.87);

// Two framed windows, a sky backdrop, and simple skyline silhouettes.
for (const [name, x] of [['Left window', 1.35], ['Right window', 3.35]]) {
  const windowGroup = group(name, x, 2.35, -4);
  const sky = box(windowGroup, 1.86, 1.96, 0.04, '#b9dee0', 0, 0, -0.05);
  sky.material = new THREE.MeshBasicMaterial({ color: '#b9dee0' });
  for (const offset of [-0.99, 0.99]) box(windowGroup, 0.1, 2.14, 0.2, colors.wood, offset, 0, 0.06);
  for (const offset of [-1.02, 1.02]) box(windowGroup, 2.08, 0.1, 0.2, colors.wood, 0, offset, 0.06);
  box(windowGroup, 0.06, 2, 0.12, '#fcf4e4', 0, 0, 0.14);
  box(windowGroup, 2, 0.06, 0.12, '#fcf4e4', 0, 0, 0.14);
  box(windowGroup, 2.18, 0.12, 0.4, colors.lightWood, 0, -1.05, 0.12);
  for (let i = 0; i < 4; i++) box(windowGroup, 0.27, 0.3 + i % 3 * 0.2, 0.025, '#96c2c4', -0.72 + i * 0.45, -0.72, -0.015);
}
const curtains = group('Curtains');
box(curtains, 4.55, 0.08, 0.08, colors.dark, 2.35, 3.56, -3.7);
for (const x of [0.32, 4.4]) for (let i = 0; i < 4; i++) {
  box(curtains, 0.12, 2.05, 0.13, i % 2 ? '#ddb894' : '#edcba9', x + (i - 1.5) * 0.1, 2.43, -3.64);
}

// Bed: timber frame, mattress, folded duvet, and two pillows.
const bed = group('Bed', -2.85, 0, 0.15);
for (const x of [-1.03, 1.03]) for (const z of [-1.72, 1.72]) box(bed, 0.17, 0.42, 0.17, colors.wood, x, 0.22, z);
box(bed, 2.55, 0.35, 4, colors.wood, 0, 0.5, 0);
box(bed, 2.55, 1.5, 0.18, colors.lightWood, 0, 1.03, -1.98);
box(bed, 2.36, 0.3, 3.77, '#fff8e9', 0, 0.8, 0);
box(bed, 2.4, 0.18, 2.65, colors.teal, 0, 0.99, 0.55);
box(bed, 2.42, 0.09, 0.5, '#6eaaa1', 0, 1.1, -0.58);
for (const x of [-0.57, 0.57]) sphere(bed, 1, '#fff1d9', x, 1.04, -1.27, [0.5, 0.16, 0.43]);
box(bed, 2.43, 0.045, 0.55, colors.pink, 0, 1.115, 1.25);

// Rug at the foot of the bed and beneath the reading area.
const rug = group('Woven rug');
box(rug, 5.35, 0.025, 3.3, '#e4ccb2', 0.25, 0.04, 1.3);
box(rug, 4.95, 0.012, 2.9, '#f2e3cc', 0.25, 0.06, 1.3);
for (const z of [-0.04, 2.64]) box(rug, 4.75, 0.01, 0.035, colors.pink, 0.25, 0.073, z);

const nightstand = group('Nightstand', -4.37, 0, -1.25);
box(nightstand, 0.75, 0.72, 0.8, colors.lightWood, 0, 0.4, 0);
box(nightstand, 0.65, 0.26, 0.03, colors.cream, 0, 0.56, 0.416);
sphere(nightstand, 0.04, colors.wood, 0, 0.56, 0.45);
cylinder(nightstand, 0.22, 0.22, 0.05, colors.dark, 0, 0.82, 0);
cylinder(nightstand, 0.025, 0.025, 0.5, colors.dark, 0, 1.1, 0);
const lampShade = cylinder(nightstand, 0.18, 0.32, 0.38, '#ffe4ac', 0, 1.4, 0);
lampShade.material = new THREE.MeshStandardMaterial({ color: '#ffe4ac', emissive: '#ffbd65', emissiveIntensity: 0.55 });
const bedsideLight = new THREE.PointLight('#ffc67c', 5, 4); bedsideLight.position.set(-4.37, 1.4, -1.25); scene.add(bedsideLight);

// Study area: desk, drawers, monitor, keyboard, mouse, books, and chair.
const desk = group('Study desk', 2.15, 0, -2.62);
box(desk, 3.5, 0.14, 1.25, colors.lightWood, 0, 1.33, 0);
for (const x of [-1.5, 1.5]) for (const z of [-0.45, 0.45]) box(desk, 0.1, 1.25, 0.1, colors.dark, x, 0.64, z);
box(desk, 0.7, 1.1, 0.95, colors.cream, 1.18, 0.66, 0);
for (const y of [0.35, 0.69, 1.03]) {
  box(desk, 0.66, 0.3, 0.04, '#eadcc6', 1.18, y, 0.49);
  box(desk, 0.16, 0.035, 0.025, colors.dark, 1.18, y, 0.52);
}
const monitor = new THREE.Group(); monitor.name = 'Monitor'; desk.add(monitor);
box(monitor, 0.6, 0.04, 0.34, colors.dark, 0, 1.44, -0.2);
box(monitor, 0.08, 0.32, 0.08, colors.dark, 0, 1.6, -0.3);
box(monitor, 1.35, 0.83, 0.09, colors.dark, 0, 2.02, -0.3);
const screen = box(monitor, 1.22, 0.7, 0.015, '#8ac7c8', 0, 2.02, -0.246);
screen.material = new THREE.MeshBasicMaterial({ color: '#91c7c6' });
for (let i = 0; i < 4; i++) box(monitor, 0.62 - i * 0.1, 0.035, 0.01, '#e5f0dc', -0.15, 2.22 - i * 0.13, -0.234);
box(desk, 0.9, 0.04, 0.28, '#dddcd2', -0.05, 1.44, 0.32);
for (let row = 0; row < 3; row++) for (let key = 0; key < 10; key++) box(desk, 0.06, 0.01, 0.045, '#677c78', -0.41 + key * 0.079, 1.465, 0.24 + row * 0.07);
sphere(desk, 0.09, colors.dark, 0.61, 1.45, 0.3, [0.8, 0.35, 1.25]);
for (let i = 0; i < 3; i++) box(desk, 0.42, 0.07, 0.52, [colors.pink, colors.teal, colors.cream][i], -1.2, 1.44 + i * 0.08, -0.1);
cylinder(desk, 0.09, 0.08, 0.22, colors.pink, 1.32, 1.51, -0.2);
const chair = group('Study chair', 2.1, 0, -0.9);
box(chair, 0.95, 0.16, 0.95, colors.teal, 0, 0.8, 0);
box(chair, 0.95, 0.95, 0.13, colors.teal, 0, 1.25, 0.44);
for (const x of [-0.34, 0.34]) for (const z of [-0.33, 0.33]) box(chair, 0.08, 0.72, 0.08, colors.wood, x, 0.4, z);

// Shelf, framed art, plant, and a small upholstered stool.
const shelf = group('Wall shelf', -2.4, 2.83, -3.75);
box(shelf, 2.6, 0.1, 0.42, colors.wood, 0, 0, 0);
for (let i = 0; i < 6; i++) box(shelf, 0.14, 0.42 + i % 2 * 0.1, 0.28, [colors.teal, colors.pink, colors.cream][i % 3], -0.95 + i * 0.19, 0.28, 0);
cylinder(shelf, 0.1, 0.18, 0.36, '#e8ccb0', 0.85, 0.23, 0);
const art = group('Framed art', -4.86, 2.5, 0.8);
box(art, 0.08, 1.3, 1.05, colors.wood, 0, 0, 0);
box(art, 0.015, 1.13, 0.88, colors.cream, 0.05, 0, 0);
const artDisc = mesh(new THREE.CircleGeometry(0.3, 40), colors.pink, art, 0.065, 0.15, 0); artDisc.rotation.y = Math.PI / 2;
box(art, 0.02, 0.22, 0.7, colors.teal, 0.07, -0.34, 0);
const plant = group('Floor plant', 4.15, 0, 1.95);
cylinder(plant, 0.42, 0.31, 0.65, colors.pink, 0, 0.34, 0);
cylinder(plant, 0.36, 0.36, 0.025, '#514b38', 0, 0.67, 0);
for (let i = 0; i < 7; i++) {
  const angle = i * Math.PI * 2 / 7;
  const stem = cylinder(plant, 0.018, 0.018, 1.1 + i % 3 * 0.25, '#527958', Math.cos(angle) * 0.16, 1.12, Math.sin(angle) * 0.16);
  stem.rotation.z = Math.sin(angle) * 0.25;
  const leaf = sphere(plant, 0.4, i % 2 ? '#6e985d' : '#4f7951', Math.cos(angle) * 0.35, 1.5 + i % 3 * 0.22, Math.sin(angle) * 0.35, [0.42, 1, 0.22]);
  leaf.rotation.set(0.2, angle, -Math.cos(angle) * 0.7);
}
const stool = group('Reading stool', 1.25, 0, 2.25);
cylinder(stool, 0.72, 0.68, 0.65, '#bd9670', 0, 0.36, 0);
cylinder(stool, 0.74, 0.74, 0.16, '#e7d8b9', 0, 0.77, 0);
box(stool, 0.52, 0.055, 0.4, colors.teal, 0.08, 0.88, 0);

function resetView() {
  controls.enableDamping = false;
  controls.update();
  const distance = Math.max(19, 18 / camera.aspect);
  camera.position.copy(new THREE.Vector3(0.64, 0.53, 0.8).normalize().multiplyScalar(distance));
  controls.target.set(0, 1, 0); controls.update();
  controls.enableDamping = true;
}
function resizeScene() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); resetView();
}
window.addEventListener('resize', resizeScene);
document.getElementById('resetView').addEventListener('click', resetView);
document.getElementById('toggleLight').addEventListener('click', (event) => {
  bedsideLight.visible = !bedsideLight.visible;
  lampShade.material.emissiveIntensity = bedsideLight.visible ? 0.55 : 0;
  event.currentTarget.textContent = `Lamp: ${bedsideLight.visible ? 'on' : 'off'}`;
  event.currentTarget.setAttribute('aria-pressed', String(bedsideLight.visible));
});
resizeScene();
renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
export { scene, camera, renderer, controls, bedsideLight };
