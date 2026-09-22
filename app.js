// 3D Cozy Lofi Room Experience
// Clean, Distraction-Free Room with Mouse/Touchpad/Touch Controls & Stealth Background Music

// --- State & Settings ---
const state = {
  yaw: 0,
  pitch: 0,
  targetYaw: 0,
  targetPitch: 0,
  fov: 65,
  targetFov: 65,
  minFov: 28,
  maxFov: 80,
  isDragging: false,
  previousMousePosition: { x: 0, y: 0 },
  touchStartDist: 0,
  initialPinchFov: 65,
  rainParticles: null,
  motesParticles: null
};

// --- Three.js Scene Setup ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080a0f);

const camera = new THREE.PerspectiveCamera(state.fov, window.innerWidth / window.innerHeight, 0.1, 100);
// Fixed camera eye-level position in center of room (Granny style)
camera.position.set(0, 1.6, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
container.appendChild(renderer.domElement);

// --- Procedural Canvas Textures for Rich Visuals ---

// 1. Warm Wood Parquet Floor Texture
function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#261b14';
  ctx.fillRect(0, 0, 512, 512);

  const plankHeight = 32;
  for (let y = 0; y < 512; y += plankHeight) {
    ctx.fillStyle = (y / plankHeight) % 2 === 0 ? '#32231a' : '#2b1e17';
    ctx.fillRect(0, y, 512, plankHeight - 2);

    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, y + plankHeight - 2, 512, 2);

    for (let x = 0; x < 512; x += 128) {
      ctx.fillRect(x + ((y * 3) % 96), y, 2, plankHeight);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// 2. Wall Texture with subtle acoustic warmth
function createWallTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#161920';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 512; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// 3. Cozy Lofi Coding Terminal Textures
function createTerminalTexture(type = 'code') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0d13';
  ctx.fillRect(0, 0, 512, 320);

  // Titlebar
  ctx.fillStyle = '#141822';
  ctx.fillRect(0, 0, 512, 28);
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(16, 14, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#eab308';
  ctx.beginPath(); ctx.arc(32, 14, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#22c55e';
  ctx.beginPath(); ctx.arc(48, 14, 5, 0, Math.PI * 2); ctx.fill();

  ctx.font = '13px Courier New';
  if (type === 'code') {
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('cozy_night.js - Lofi Workspace', 70, 18);

    const lines = [
      ['// Late night lofi session', '#71717a'],
      ['const ', '#f59e0b', 'track ', '#38bdf8', '= ', '#f0f6fc', '"Rakhlo Tum Chupake";', '#f59e0b'],
      ['const ', '#f59e0b', 'mood ', '#38bdf8', '= ', '#f0f6fc', 'LOFI_MIDNIGHT_WARMTH;', '#10b981'],
      ['player.playBackground({ loop: true, volume: 0.85 });', '#e2e8f0'],
      ['window.rainOutside.start({ intensity: "gentle" });', '#60a5fa'],
      ['lamp.glowWarmth({ temp: "3000K", cozy: true });', '#fbbf24'],
      ['console.log("Room atmosphere relaxed & peaceful.");', '#a1a1aa']
    ];

    let y = 58;
    lines.forEach(row => {
      let x = 20;
      for (let i = 0; i < row.length; i += 2) {
        ctx.fillStyle = row[i + 1] || '#f0f6fc';
        ctx.fillText(row[i], x, y);
        x += ctx.measureText(row[i]).width;
      }
      y += 26;
    });
  } else {
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('bash - lofi radio daemon', 70, 18);

    ctx.fillStyle = '#10b981';
    ctx.fillText('$ lofi-player --audio "Rakhlo Tum Chupake"', 20, 58);
    ctx.fillStyle = '#f0f6fc';
    ctx.fillText('[CONNECTED] Audio stream active & looping smoothly', 20, 84);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('Artist: Arpit Bala / Adil (Maharani)', 20, 110);
    ctx.fillStyle = '#60a5fa';
    ctx.fillText('Controls: Mouse / Touchpad / Finger look-around & zoom', 20, 140);

    ctx.fillStyle = '#f59e0b';
    ctx.fillText('EQ:  ▂▃▅▆▇▆▅▃▂ ▂▃▅▆▇▆▅▃▂ [COZY LOFI]', 20, 175);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return { texture };
}

// 4. Rainy Midnight Window Backdrop
function createWindowBackdropTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#040711');
  grad.addColorStop(0.7, '#0b162c');
  grad.addColorStop(1, '#1b2a47');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Soft Moon
  ctx.fillStyle = 'rgba(255, 245, 220, 0.9)';
  ctx.beginPath();
  ctx.arc(380, 100, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 245, 220, 0.16)';
  ctx.beginPath();
  ctx.arc(380, 100, 75, 0, Math.PI * 2);
  ctx.fill();

  // Distant Buildings
  const buildings = [
    { x: 20, w: 60, h: 220, color: '#090d16' },
    { x: 90, w: 80, h: 280, color: '#070a12' },
    { x: 180, w: 50, h: 180, color: '#090d16' },
    { x: 240, w: 90, h: 320, color: '#06080f' },
    { x: 340, w: 70, h: 250, color: '#080c14' },
    { x: 420, w: 80, h: 290, color: '#06080e' }
  ];

  buildings.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, 512 - b.h, b.w, b.h);

    for (let wy = 512 - b.h + 20; wy < 500; wy += 20) {
      for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 14) {
        if (Math.random() > 0.5) {
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(wx, wy, 4, 6);
        }
      }
    }
  });

  return new THREE.CanvasTexture(canvas);
}

// 5. Aesthetic Lofi Poster
function createPosterTexture(title, subtitle, accentColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#10141c';
  ctx.fillRect(0, 0, 256, 360);

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, 232, 336);

  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(128, 140, 50, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#10141c';
  ctx.beginPath();
  ctx.arc(148, 130, 45, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(title, 128, 250);

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '12px Courier New';
  ctx.fillText(subtitle, 128, 280);

  return new THREE.CanvasTexture(canvas);
}

// --- Build the 3D Room ---

const roomGroup = new THREE.Group();
scene.add(roomGroup);

const ROOM_WIDTH = 6;
const ROOM_HEIGHT = 3.2;
const ROOM_DEPTH = 6;

// Floor
const floorGeo = new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH);
const floorMat = new THREE.MeshStandardMaterial({
  map: createWoodTexture(),
  roughness: 0.35,
  metalness: 0.08
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
roomGroup.add(floor);

// Cozy Carpet Rug
const rugGeo = new THREE.PlaneGeometry(3.0, 2.6);
const rugMat = new THREE.MeshStandardMaterial({
  color: 0x1e2733,
  roughness: 0.9,
  metalness: 0.02
});
const rug = new THREE.Mesh(rugGeo, rugMat);
rug.rotation.x = -Math.PI / 2;
rug.position.set(0, 0.01, -0.6);
rug.receiveShadow = true;
roomGroup.add(rug);

// Ceiling
const ceilingGeo = new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH);
const ceilingMat = new THREE.MeshStandardMaterial({
  color: 0x12151b,
  roughness: 0.8
});
const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = ROOM_HEIGHT;
roomGroup.add(ceiling);

// Ceiling Warm Trim
const ceilingTrimGeo = new THREE.BoxGeometry(4.6, 0.05, 4.6);
const ceilingTrimMat = new THREE.MeshStandardMaterial({
  color: 0x000000,
  emissive: 0xf59e0b,
  emissiveIntensity: 0.35
});
const ceilingTrim = new THREE.Mesh(ceilingTrimGeo, ceilingTrimMat);
ceilingTrim.position.set(0, ROOM_HEIGHT - 0.03, 0);
roomGroup.add(ceilingTrim);

// Walls
const wallMat = new THREE.MeshStandardMaterial({
  map: createWallTexture(),
  roughness: 0.85,
  metalness: 0.1
});

// North Wall (Front)
const northWallGeo = new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_HEIGHT);
const northWall = new THREE.Mesh(northWallGeo, wallMat);
northWall.position.set(0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2);
northWall.receiveShadow = true;
roomGroup.add(northWall);

// South Wall (Back)
const southWall = new THREE.Mesh(northWallGeo, wallMat);
southWall.position.set(0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2);
southWall.rotation.y = Math.PI;
southWall.receiveShadow = true;
roomGroup.add(southWall);

// East Wall (Right)
const sideWallGeo = new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT);
const eastWall = new THREE.Mesh(sideWallGeo, wallMat);
eastWall.position.set(ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0);
eastWall.rotation.y = -Math.PI / 2;
eastWall.receiveShadow = true;
roomGroup.add(eastWall);

// West Wall (Left)
const westWall = new THREE.Mesh(sideWallGeo, wallMat);
westWall.position.set(-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0);
westWall.rotation.y = Math.PI / 2;
westWall.receiveShadow = true;
roomGroup.add(westWall);

// --- Window to Rainy Night (North Wall, Right side) ---
const windowFrameGeo = new THREE.BoxGeometry(1.8, 1.8, 0.1);
const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x161a22, roughness: 0.5 });
const windowFrame = new THREE.Mesh(windowFrameGeo, windowFrameMat);
windowFrame.position.set(1.6, 1.8, -ROOM_DEPTH / 2 + 0.05);
roomGroup.add(windowFrame);

const windowGlassGeo = new THREE.PlaneGeometry(1.6, 1.6);
const windowGlassMat = new THREE.MeshStandardMaterial({
  map: createWindowBackdropTexture(),
  roughness: 0.2,
  metalness: 0.1,
  emissive: 0x1b2a47,
  emissiveIntensity: 0.4
});
const windowGlass = new THREE.Mesh(windowGlassGeo, windowGlassMat);
windowGlass.position.set(1.6, 1.8, -ROOM_DEPTH / 2 + 0.1);
roomGroup.add(windowGlass);

// Rain particles outside window
const rainCount = 350;
const rainGeo = new THREE.BufferGeometry();
const rainPos = new Float32Array(rainCount * 3);
for (let i = 0; i < rainCount * 3; i += 3) {
  rainPos[i] = 1.6 + (Math.random() - 0.5) * 1.6;
  rainPos[i + 1] = Math.random() * 2 + 1;
  rainPos[i + 2] = -ROOM_DEPTH / 2 + 0.12 + Math.random() * 0.05;
}
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
const rainMat = new THREE.PointsMaterial({
  color: 0x93c5fd,
  size: 0.02,
  transparent: true,
  opacity: 0.65
});
const rainParticles = new THREE.Points(rainGeo, rainMat);
roomGroup.add(rainParticles);
state.rainParticles = rainParticles;

// --- Furniture: Desk Workstation (North Wall) ---
const deskGroup = new THREE.Group();
deskGroup.position.set(-0.6, 0, -2.1);
roomGroup.add(deskGroup);

// Desk Top
const deskTopGeo = new THREE.BoxGeometry(2.0, 0.06, 0.9);
const deskTopMat = new THREE.MeshStandardMaterial({ color: 0x2e231c, roughness: 0.35, metalness: 0.1 });
const deskTop = new THREE.Mesh(deskTopGeo, deskTopMat);
deskTop.position.set(0, 0.8, 0);
deskTop.castShadow = true;
deskTop.receiveShadow = true;
deskGroup.add(deskTop);

// Desk Metal Legs
const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.8, 16);
const legMat = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.4, metalness: 0.8 });
[[-0.9, -0.35], [0.9, -0.35], [-0.9, 0.35], [0.9, 0.35]].forEach(([lx, lz]) => {
  const leg = new THREE.Mesh(legGeo, legMat);
  leg.position.set(lx, 0.4, lz);
  leg.castShadow = true;
  deskGroup.add(leg);
});

// Warm LED strip under desk
const deskNeonGeo = new THREE.BoxGeometry(1.9, 0.02, 0.02);
const deskNeonMat = new THREE.MeshStandardMaterial({
  color: 0x000000,
  emissive: 0xf59e0b,
  emissiveIntensity: 0.6
});
const deskNeon = new THREE.Mesh(deskNeonGeo, deskNeonMat);
deskNeon.position.set(0, 0.78, 0.42);
deskGroup.add(deskNeon);

// Mousepad
const matGeo = new THREE.BoxGeometry(1.1, 0.005, 0.45);
const matMaterial = new THREE.MeshStandardMaterial({ color: 0x141822, roughness: 0.8 });
const mousepad = new THREE.Mesh(matGeo, matMaterial);
mousepad.position.set(-0.1, 0.835, 0.08);
deskGroup.add(mousepad);

// Keyboard
const kbGeo = new THREE.BoxGeometry(0.42, 0.015, 0.14);
const kbMat = new THREE.MeshStandardMaterial({ color: 0x222733, roughness: 0.5 });
const keyboard = new THREE.Mesh(kbGeo, kbMat);
keyboard.position.set(-0.15, 0.845, 0.12);
deskGroup.add(keyboard);

// Mouse
const mouseGeo = new THREE.BoxGeometry(0.06, 0.02, 0.1);
const mouse = new THREE.Mesh(mouseGeo, kbMat);
mouse.position.set(0.25, 0.845, 0.12);
deskGroup.add(mouse);

// PC Tower
const pcGeo = new THREE.BoxGeometry(0.24, 0.48, 0.44);
const pcMat = new THREE.MeshStandardMaterial({ color: 0x0f131a, roughness: 0.3, metalness: 0.6 });
const pcTower = new THREE.Mesh(pcGeo, pcMat);
pcTower.position.set(0.8, 1.07, -0.15);
pcTower.castShadow = true;
deskGroup.add(pcTower);

// Dual Monitors
const screenTex1 = createTerminalTexture('code');
const screenTex2 = createTerminalTexture('terminal');

function createMonitor(tex) {
  const monGroup = new THREE.Group();

  const bezelGeo = new THREE.BoxGeometry(0.66, 0.4, 0.03);
  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x11141c, roughness: 0.4 });
  const bezel = new THREE.Mesh(bezelGeo, bezelMat);
  monGroup.add(bezel);

  const screenGeo = new THREE.PlaneGeometry(0.63, 0.37);
  const screenMat = new THREE.MeshStandardMaterial({
    map: tex.texture,
    emissive: 0xffffff,
    emissiveMap: tex.texture,
    emissiveIntensity: 0.65,
    roughness: 0.3
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.z = 0.016;
  monGroup.add(screen);

  const standGeo = new THREE.BoxGeometry(0.04, 0.2, 0.04);
  const stand = new THREE.Mesh(standGeo, bezelMat);
  stand.position.set(0, -0.22, -0.05);
  monGroup.add(stand);

  const baseGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.015, 24);
  const base = new THREE.Mesh(baseGeo, bezelMat);
  base.position.set(0, -0.32, 0);
  monGroup.add(base);

  return monGroup;
}

const mon1 = createMonitor(screenTex1);
mon1.position.set(-0.42, 1.15, -0.15);
mon1.rotation.y = 0.15;
deskGroup.add(mon1);

const mon2 = createMonitor(screenTex2);
mon2.position.set(0.24, 1.15, -0.15);
mon2.rotation.y = -0.18;
deskGroup.add(mon2);

// Cozy Desk Lamp (Amber warmth)
const lampBaseGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.02, 24);
const lampMat = new THREE.MeshStandardMaterial({ color: 0x3f342d, metalness: 0.4, roughness: 0.3 });
const lampBase = new THREE.Mesh(lampBaseGeo, lampMat);
lampBase.position.set(-0.82, 0.84, -0.15);
deskGroup.add(lampBase);

const lampPoleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 12);
const lampPole = new THREE.Mesh(lampPoleGeo, lampMat);
lampPole.position.set(-0.82, 1.01, -0.15);
deskGroup.add(lampPole);

const lampShadeGeo = new THREE.ConeGeometry(0.12, 0.14, 24, 1, true);
const lampShadeMat = new THREE.MeshStandardMaterial({
  color: 0xd97706,
  emissive: 0xf59e0b,
  emissiveIntensity: 0.9,
  roughness: 0.3,
  side: THREE.DoubleSide
});
const lampShade = new THREE.Mesh(lampShadeGeo, lampShadeMat);
lampShade.position.set(-0.76, 1.15, -0.1);
lampShade.rotation.z = -0.4;
deskGroup.add(lampShade);

// Main Warm Lamp Spotlight
const lampLight = new THREE.SpotLight(0xffaa44, 3.4, 5.0, Math.PI / 3, 0.4, 1.2);
lampLight.position.set(-0.76, 1.15, -0.1);
lampLight.target.position.set(-0.2, 0.8, 0.1);
lampLight.castShadow = true;
lampLight.shadow.mapSize.width = 1024;
lampLight.shadow.mapSize.height = 1024;
deskGroup.add(lampLight);
deskGroup.add(lampLight.target);

// --- Ergonomic Chair ---
const chairGroup = new THREE.Group();
chairGroup.position.set(-0.6, 0, -1.3);
roomGroup.add(chairGroup);

const chairSeatGeo = new THREE.BoxGeometry(0.5, 0.08, 0.5);
const chairSeatMat = new THREE.MeshStandardMaterial({ color: 0x222a36, roughness: 0.6 });
const chairSeat = new THREE.Mesh(chairSeatGeo, chairSeatMat);
chairSeat.position.set(0, 0.52, 0);
chairSeat.castShadow = true;
chairGroup.add(chairSeat);

const chairBackGeo = new THREE.BoxGeometry(0.48, 0.55, 0.06);
const chairBack = new THREE.Mesh(chairBackGeo, chairSeatMat);
chairBack.position.set(0, 0.82, 0.22);
chairBack.castShadow = true;
chairGroup.add(chairBack);

const chairStemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.48, 16);
const chairStem = new THREE.Mesh(chairStemGeo, legMat);
chairStem.position.set(0, 0.26, 0);
chairGroup.add(chairStem);

// --- Bookshelf & Vinyl Records (West Wall) ---
const shelfGroup = new THREE.Group();
shelfGroup.position.set(-ROOM_WIDTH / 2 + 0.35, 0, 0.4);
roomGroup.add(shelfGroup);

const shelfFrameGeo = new THREE.BoxGeometry(0.45, 2.2, 1.4);
const shelfFrameMat = new THREE.MeshStandardMaterial({ color: 0x261d16, roughness: 0.5 });
const shelfFrame = new THREE.Mesh(shelfFrameGeo, shelfFrameMat);
shelfFrame.position.set(0, 1.1, 0);
shelfFrame.castShadow = true;
shelfGroup.add(shelfFrame);

const bookColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899];
for (let s = 0; s < 3; s++) {
  const sy = 0.5 + s * 0.55;
  for (let b = 0; b < 6; b++) {
    const bookGeo = new THREE.BoxGeometry(0.28, 0.24 + Math.random() * 0.08, 0.05);
    const bookMat = new THREE.MeshStandardMaterial({ color: bookColors[(s * 6 + b) % bookColors.length], roughness: 0.6 });
    const book = new THREE.Mesh(bookGeo, bookMat);
    book.position.set(-0.02, sy + 0.12, -0.45 + b * 0.08);
    shelfGroup.add(book);
  }
}

// Vinyl Record Player
const playerGeo = new THREE.BoxGeometry(0.35, 0.08, 0.38);
const playerMat = new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.5, roughness: 0.3 });
const vinylPlayer = new THREE.Mesh(playerGeo, playerMat);
vinylPlayer.position.set(0, 1.68, 0.2);
shelfGroup.add(vinylPlayer);

const recordGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.01, 32);
const recordMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2, metalness: 0.8 });
const record = new THREE.Mesh(recordGeo, recordMat);
record.position.set(0, 1.73, 0.2);
shelfGroup.add(record);

// Plant Pot
const potGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.12, 16);
const potMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.5 });
const pot = new THREE.Mesh(potGeo, potMat);
pot.position.set(0, 2.26, -0.3);
shelfGroup.add(pot);

const plantLeavesGeo = new THREE.DodecahedronGeometry(0.12, 1);
const plantLeavesMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
const plant = new THREE.Mesh(plantLeavesGeo, plantLeavesMat);
plant.position.set(0, 2.38, -0.3);
shelfGroup.add(plant);

// --- Wall Posters ---
const poster1Geo = new THREE.PlaneGeometry(0.9, 1.2);
const poster1Mat = new THREE.MeshStandardMaterial({
  map: createPosterTexture('NIGHT CITY', 'Lofi & Code Beats', '#f59e0b'),
  roughness: 0.4
});
const poster1 = new THREE.Mesh(poster1Geo, poster1Mat);
poster1.position.set(ROOM_WIDTH / 2 - 0.02, 1.9, -0.8);
poster1.rotation.y = -Math.PI / 2;
roomGroup.add(poster1);

const poster2Geo = new THREE.PlaneGeometry(0.9, 1.2);
const poster2Mat = new THREE.MeshStandardMaterial({
  map: createPosterTexture('RAKHLO TUM', 'Arpit Bala / Karun', '#f59e0b'),
  roughness: 0.4
});
const poster2 = new THREE.Mesh(poster2Geo, poster2Mat);
poster2.position.set(0.8, 1.9, ROOM_DEPTH / 2 - 0.02);
poster2.rotation.y = Math.PI;
roomGroup.add(poster2);

// Cozy Bed in Corner
const bedGroup = new THREE.Group();
bedGroup.position.set(-1.8, 0, 1.8);
roomGroup.add(bedGroup);

const bedBaseGeo = new THREE.BoxGeometry(1.6, 0.35, 2.0);
const bedBaseMat = new THREE.MeshStandardMaterial({ color: 0x222834, roughness: 0.6 });
const bedBase = new THREE.Mesh(bedBaseGeo, bedBaseMat);
bedBase.position.y = 0.175;
bedGroup.add(bedBase);

const mattressGeo = new THREE.BoxGeometry(1.5, 0.22, 1.9);
const mattressMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
const mattress = new THREE.Mesh(mattressGeo, mattressMat);
mattress.position.y = 0.42;
bedGroup.add(mattress);

const blanketGeo = new THREE.BoxGeometry(1.52, 0.1, 1.2);
const blanketMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
const blanket = new THREE.Mesh(blanketGeo, blanketMat);
blanket.position.set(0, 0.48, 0.35);
bedGroup.add(blanket);

const pillowGeo = new THREE.BoxGeometry(0.6, 0.12, 0.35);
const pillowMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });
const pillow = new THREE.Mesh(pillowGeo, pillowMat);
pillow.position.set(0, 0.58, -0.65);
bedGroup.add(pillow);

// Warm Bed area pointlight
const bedLight = new THREE.PointLight(0xf59e0b, 0.55, 4.0, 1.5);
bedLight.position.set(-1.8, 1.8, ROOM_DEPTH / 2 - 0.3);
roomGroup.add(bedLight);

// --- Global Cozy Lighting ---
const ambientLight = new THREE.AmbientLight(0x232938, 1.1);
scene.add(ambientLight);

const ceilingLight = new THREE.PointLight(0xffe8cc, 0.9, 7.5, 1.2);
ceilingLight.position.set(0, ROOM_HEIGHT - 0.2, 0);
scene.add(ceilingLight);

const windowMoonLight = new THREE.DirectionalLight(0x60a5fa, 0.7);
windowMoonLight.position.set(2.5, 3.5, -4.5);
windowMoonLight.target.position.set(0, 1.0, 0);
scene.add(windowMoonLight);
scene.add(windowMoonLight.target);

// Subtle Floating Atmospheric Dust Motes (Soft and tiny)
const motesCount = 120;
const motesGeo = new THREE.BufferGeometry();
const motesPos = new Float32Array(motesCount * 3);
for (let i = 0; i < motesCount * 3; i += 3) {
  motesPos[i] = (Math.random() - 0.5) * 5;
  motesPos[i + 1] = Math.random() * 2.8 + 0.2;
  motesPos[i + 2] = (Math.random() - 0.5) * 5;
}
motesGeo.setAttribute('position', new THREE.BufferAttribute(motesPos, 3));
const motesMat = new THREE.PointsMaterial({
  color: 0xf59e0b,
  size: 0.007,
  transparent: true,
  opacity: 0.25
});
const motesParticles = new THREE.Points(motesGeo, motesMat);
scene.add(motesParticles);
state.motesParticles = motesParticles;

// --- Natural Mouse / Touchpad / Finger Controls (Granny Style) ---

const PITCH_LIMIT = Math.PI / 3; // Clamp look (60 deg up/down)
const MOUSE_SENSITIVITY = 0.0035;

function updateCamera() {
  state.yaw += (state.targetYaw - state.yaw) * 0.14;
  state.pitch += (state.targetPitch - state.pitch) * 0.14;

  state.targetPitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, state.targetPitch));
  state.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, state.pitch));

  const cosPitch = Math.cos(state.pitch);
  const lookTarget = new THREE.Vector3(
    camera.position.x + Math.sin(state.yaw) * cosPitch,
    camera.position.y + Math.sin(state.pitch),
    camera.position.z - Math.cos(state.yaw) * cosPitch
  );

  camera.lookAt(lookTarget);

  // Smooth FOV zoom
  state.fov += (state.targetFov - state.fov) * 0.12;
  camera.fov = state.fov;
  camera.updateProjectionMatrix();
}

// Mouse & Touchpad Drag Look-Around
window.addEventListener('mousedown', (e) => {
  if (e.target.closest('#audio-toggle, .enter-overlay')) return;
  state.isDragging = true;
  state.previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mousemove', (e) => {
  if (!state.isDragging) return;
  const deltaX = e.clientX - state.previousMousePosition.x;
  const deltaY = e.clientY - state.previousMousePosition.y;

  state.targetYaw -= deltaX * MOUSE_SENSITIVITY;
  state.targetPitch -= deltaY * MOUSE_SENSITIVITY;

  state.previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mouseup', () => { state.isDragging = false; });

// Touch / Finger Support (1 finger drag to look around, 2 fingers pinch to zoom)
window.addEventListener('touchstart', (e) => {
  if (e.target.closest('#audio-toggle, .enter-overlay')) return;
  if (e.touches.length === 1) {
    state.isDragging = true;
    state.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.touches.length === 2) {
    state.isDragging = false;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    state.touchStartDist = Math.hypot(dx, dy);
    state.initialPinchFov = state.targetFov;
  }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
  if (e.touches.length === 1 && state.isDragging) {
    const deltaX = e.touches[0].clientX - state.previousMousePosition.x;
    const deltaY = e.touches[0].clientY - state.previousMousePosition.y;

    state.targetYaw -= deltaX * MOUSE_SENSITIVITY * 1.15;
    state.targetPitch -= deltaY * MOUSE_SENSITIVITY * 1.15;

    state.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.touches.length === 2 && state.touchStartDist > 0) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    const scale = state.touchStartDist / dist;
    state.targetFov = Math.max(state.minFov, Math.min(state.maxFov, state.initialPinchFov * scale));
  }
}, { passive: false });

window.addEventListener('touchend', (e) => {
  if (e.touches.length < 2) state.touchStartDist = 0;
  if (e.touches.length === 0) state.isDragging = false;
});

// Mouse Wheel & Touchpad 2-finger scroll to zoom
window.addEventListener('wheel', (e) => {
  const zoomDelta = e.deltaY * 0.05;
  state.targetFov = Math.max(state.minFov, Math.min(state.maxFov, state.targetFov + zoomDelta));
}, { passive: true });

// Double click to smoothly center view
window.addEventListener('dblclick', (e) => {
  if (e.target.closest('#audio-toggle, .enter-overlay')) return;
  state.targetYaw = 0;
  state.targetPitch = 0;
  state.targetFov = 65;
});

// Silent Keyboard Controls (Arrow keys & WASD)
const activeKeys = {};
window.addEventListener('keydown', (e) => { activeKeys[e.key] = true; });
window.addEventListener('keyup', (e) => { activeKeys[e.key] = false; });

function handleKeyboard() {
  const SPEED = 0.035;
  if (activeKeys['ArrowLeft'] || activeKeys['a'] || activeKeys['A']) state.targetYaw += SPEED;
  if (activeKeys['ArrowRight'] || activeKeys['d'] || activeKeys['D']) state.targetYaw -= SPEED;
  if (activeKeys['ArrowUp'] || activeKeys['w'] || activeKeys['W']) state.targetPitch += SPEED * 0.8;
  if (activeKeys['ArrowDown'] || activeKeys['s'] || activeKeys['S']) state.targetPitch -= SPEED * 0.8;
}

// Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Native Background Audio Controller (Direct Local Audio File) ---

const bgAudio = document.getElementById('bg-audio');
const soundWave = document.getElementById('sound-wave');
const audioToggle = document.getElementById('audio-toggle');

function startAudio() {
  if (bgAudio) {
    bgAudio.volume = 0.85;
    bgAudio.play().then(() => {
      console.log('Audio playing successfully.');
      if (soundWave) soundWave.classList.add('playing');
    }).catch(err => {
      console.warn('Playback error (waiting for user gesture):', err);
    });
  }
}

function toggleAudio() {
  if (!bgAudio) return;
  if (bgAudio.paused) {
    bgAudio.play();
    if (soundWave) soundWave.classList.add('playing');
  } else {
    bgAudio.pause();
    if (soundWave) soundWave.classList.remove('playing');
  }
}

if (audioToggle) {
  audioToggle.addEventListener('click', toggleAudio);
}

// Enter Room Overlay Trigger
const enterOverlay = document.getElementById('enter-overlay');
const enterBtn = document.getElementById('enter-btn');

function handleEnterRoom() {
  if (enterOverlay) {
    enterOverlay.classList.add('hidden');
  }
  startAudio();
}

if (enterBtn) {
  enterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleEnterRoom();
  });
}

if (enterOverlay) {
  enterOverlay.addEventListener('click', () => {
    handleEnterRoom();
  });
}

// Global first click fallback in case user enters without clicking button
window.addEventListener('click', () => {
  if (bgAudio && bgAudio.paused && (!enterOverlay || enterOverlay.classList.contains('hidden'))) {
    bgAudio.play().then(() => {
      if (soundWave) soundWave.classList.add('playing');
    }).catch(() => {});
  }
}, { once: true });

// --- Render Loop ---

let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  handleKeyboard();
  updateCamera();

  // Rain outside window
  if (state.rainParticles) {
    const pos = state.rainParticles.geometry.attributes.position.array;
    for (let i = 1; i < pos.length; i += 3) {
      pos[i] -= delta * 3.5;
      if (pos[i] < 0.9) pos[i] = 2.8;
    }
    state.rainParticles.geometry.attributes.position.needsUpdate = true;
  }

  // Microscopic gentle dust drift
  if (state.motesParticles) {
    const mPos = state.motesParticles.geometry.attributes.position.array;
    for (let i = 0; i < mPos.length; i += 3) {
      mPos[i + 1] += Math.sin(time + mPos[i]) * 0.0006;
      mPos[i] += Math.cos(time + mPos[i + 2]) * 0.0004;
    }
    state.motesParticles.geometry.attributes.position.needsUpdate = true;
  }

  renderer.render(scene, camera);
}

animate();
