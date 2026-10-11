// ════════════════════════════════════════════════════════════════
// js/horses3d.js — 🐴 Wild horses you can ride (Mischa's idea!)
//
// Wild horses roam the jungle forest, wandering and munching grass.
// Walk up to one and press R (or tap the 🐴 Ride! button) to jump on.
// Riding makes you much faster! The first time you ride a horse you tame
// it — it gets a name and a saddle. Press R again to hop off; your horse
// waits for you right where you left it.
//
// Fun things to change:
//   HORSE_SPEED  — how much faster you go when riding (2 = twice as fast)
//   HORSE_NAMES  — the names your horses can get
//   HORSE_COATS  — horse colours: [coat, mane]
//   How many horses: wildHorses in js/planets3d.js
// ════════════════════════════════════════════════════════════════

const HORSE_SPEED = 1.9;
const HORSE_SEAT = 0.92;      // how high you sit (saddle height)
const HORSE_REACH = 2.0;      // how close you need to be to hop on
const HORSE_NAMES = ['Thunder', 'Biscuit', 'Comet', 'Pepper', 'Blaze', 'Star', 'Maple', 'Rocket', 'Shadow', 'Pickles', 'Storm', 'Nugget'];
const HORSE_COATS = [
  [0x8b5a2b, 0x2a1a10],  // brown
  [0x3b2a20, 0x111111],  // dark bay
  [0xeae6dc, 0xb8b0a0],  // white
  [0xd9a85b, 0xf3e6c4],  // palomino
  [0x222222, 0x0a0a0a],  // black
  [0xa0522d, 0x6b2e14],  // chestnut
  [0x8a8f96, 0x3a3d42]   // grey
];

// ── The horse model (faces +z, feet on the ground) ────────────────
function makeHorseMesh(coat, mane) {
  const g = new THREE.Group();
  const coatM = new THREE.MeshStandardMaterial({ color: coat, roughness: 0.8 });
  const maneM = new THREE.MeshStandardMaterial({ color: mane, roughness: 0.9 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 1.15), coatM);
  body.position.y = 1.05; g.add(body);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), coatM);
  chest.position.set(0, 1.05, 0.5); chest.scale.set(0.85, 0.85, 0.7); g.add(chest);
  const rump = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), coatM);
  rump.position.set(0, 1.08, -0.5); rump.scale.set(0.9, 0.85, 0.7); g.add(rump);
  // Legs pivot at the hip so they can swing
  const legGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.85, 6); legGeo.translate(0, -0.425, 0);
  const legs = [[0.17, 0.42], [-0.17, 0.42], [0.17, -0.42], [-0.17, -0.42]].map(([lx, lz]) => {
    const l = new THREE.Mesh(legGeo, coatM); l.position.set(lx, 0.85, lz);
    const hoof = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.1, 0.15), dark); hoof.position.set(0, -0.85, 0.01); l.add(hoof);
    g.add(l); return l;
  });
  // Neck + head on a pivot so the horse can bend down to eat grass
  const neck = new THREE.Group(); neck.position.set(0, 1.2, 0.5); g.add(neck);
  const neckM = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.65, 0.3), coatM);
  neckM.position.set(0, 0.28, 0.1); neckM.rotation.x = 0.5; neck.add(neckM);
  const maneMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.14), maneM);
  maneMesh.position.set(0, 0.36, -0.03); maneMesh.rotation.x = 0.5; neck.add(maneMesh);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.55), coatM);
  head.position.set(0, 0.62, 0.38); head.rotation.x = 0.25; neck.add(head);
  const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.16), dark);
  muzzle.position.set(0, 0.54, 0.64); muzzle.rotation.x = 0.25; neck.add(muzzle);
  [-1, 1].forEach(sx => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.15, 4), coatM); ear.position.set(sx * 0.08, 0.82, 0.22); neck.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), dark); eye.position.set(sx * 0.125, 0.68, 0.46); neck.add(eye);
  });
  // Tail
  const tailGeo = new THREE.CylinderGeometry(0.05, 0.12, 0.7, 5); tailGeo.translate(0, -0.35, 0);
  const tail = new THREE.Mesh(tailGeo, maneM); tail.position.set(0, 1.22, -0.62); tail.rotation.x = 0.5; g.add(tail);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.userData = { legs, neck, tail };
  return g;
}

function addSaddle(h) {
  if (h.saddle) return;
  const s = new THREE.Group();
  const blanket = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.62), new THREE.MeshStandardMaterial({ color: 0x2a6acc, roughness: 0.9 }));
  blanket.position.y = 1.31;
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.09, 0.46), new THREE.MeshStandardMaterial({ color: 0x6b3a1a, roughness: 0.7 }));
  seat.position.y = 1.36;
  const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.12, 6), seat.material);
  horn.position.set(0, 1.45, 0.2);
  s.add(blanket, seat, horn); h.mesh.add(s); h.saddle = s;
}

// ── Spawning ──────────────────────────────────────────────────────
function horseBlocked(x, z) {
  return isSolid(x, z) || tileAt(x, z) === 7; // wild horses stay out of the village
}

function spawnWildHorses(cfg, scene) {
  E.horses = []; E.riding = null;
  const n = cfg.wildHorses || 0; if (!n) return;
  const zMin = E.mazeGate ? E.mazeGate.z + 3 : 2;   // jungle: horses live in the forest
  const spots = [];
  for (let z = zMin; z < E.rows - 2; z++) for (let x = 2; x < E.cols - 2; x++) {
    let ok = true;
    for (let dz = -1; dz <= 1 && ok; dz++) for (let dx = -1; dx <= 1; dx++) if (horseBlocked(x + dx, z + dz)) { ok = false; break; }
    if (ok) spots.push([x, z]);
  }
  const names = HORSE_NAMES.slice().sort(() => Math.random() - 0.5);
  for (let i = 0; i < n && spots.length; i++) {
    const [x, z] = spots.splice(Math.floor(Math.random() * spots.length), 1)[0];
    const [coat, mane] = HORSE_COATS[Math.floor(Math.random() * HORSE_COATS.length)];
    const mesh = makeHorseMesh(coat, mane);
    mesh.position.set(x + 0.5, 0, z + 0.5);
    mesh.rotation.y = Math.random() * Math.PI * 2;
    scene.add(mesh);
    E.horses.push({ mesh, name: names[i % names.length], tamed: false, saddle: null,
      state: 'graze', timer: 1 + Math.random() * 3, dir: mesh.rotation.y, gait: Math.random() * 6 });
  }
}

// ── Getting on and off ────────────────────────────────────────────
function nearestHorse() {
  if (!E.horses || !E.player) return null;
  let best = null, bd = HORSE_REACH;
  E.horses.forEach(h => { const d = h.mesh.position.distanceTo(E.player.position); if (d < bd) { bd = d; best = h; } });
  return best;
}

function toggleRide() {
  if (!E.running || gamePaused || !E.player) return;
  if (E.riding) {                                   // hop off beside the horse
    const h = E.riding; E.riding = null; h.state = 'idle'; h.timer = 0;
    const p = E.player.position;
    for (const [dx, dz] of [[0.9, 0], [-0.9, 0], [0, 0.9], [0, -0.9]]) {
      if (!isSolid(p.x + dx, p.z + dz)) { p.x += dx; p.z += dz; break; }
    }
    const ud = E.player.userData; if (ud.legs) ud.legs.forEach(l => { l.rotation.z = 0; });
    if (typeof SFX !== 'undefined' && SFX.powerup) SFX.powerup();
    return;
  }
  const h = nearestHorse(); if (!h) return;
  E.riding = h; h.state = 'ridden';
  E.player.position.x = h.mesh.position.x; E.player.position.z = h.mesh.position.z;
  E.faceAngle = h.mesh.rotation.y;
  if (!h.tamed) {
    h.tamed = true; addSaddle(h);
    showToast('🐴 You tamed ' + h.name + '!', h.name + ' is your horse now. Ride fast! Press R (or tap Get off) to hop down.');
  } else showToast('🐴 ' + h.name, 'Giddy-up! ' + h.name + ' is happy to see you.');
  if (typeof SFX !== 'undefined' && SFX.powerup) SFX.powerup();
}

window.addEventListener('keydown', e => {
  if (e.key !== 'r' && e.key !== 'R') return;
  if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  toggleRide();
});

function rideBtnEl() {
  let b = document.getElementById('rideBtn');
  if (b) return b;
  const view = document.getElementById('view3d'); if (!view) return null;
  b = document.createElement('button');
  b.id = 'rideBtn';
  b.style.cssText = 'position:absolute;bottom:14px;left:50%;transform:translateX(-50%);z-index:42;display:none;' +
    'padding:9px 18px;font-size:15px;font-weight:bold;font-family:inherit;color:#fff;cursor:pointer;' +
    'background:#a0581e;border:3px solid #ffd27a;border-radius:12px;box-shadow:0 3px 8px rgba(0,0,0,0.6);';
  b.addEventListener('click', e => { e.stopPropagation(); toggleRide(); });
  view.appendChild(b);
  return b;
}

// ── Every frame (runs right after updatePlayer) ───────────────────
function updateHorses(dt) {
  const btn = rideBtnEl();
  if (!E.horses || !E.horses.length || !E.player) { if (btn) btn.style.display = 'none'; return; }
  const p = E.player.position;

  E.horses.forEach(h => {
    const m = h.mesh, ud = m.userData;
    let moving = 0;
    if (h.state === 'ridden') {
      // The horse carries you: follow the player and face where they face
      const dx = p.x - m.position.x, dz = p.z - m.position.z;
      moving = Math.hypot(dx, dz) / Math.max(dt, 0.001);
      m.position.x = p.x; m.position.z = p.z; m.rotation.y = E.faceAngle;
      ud.neck.rotation.x *= 0.85;
    } else if (h.state === 'wander') {
      const sp = 1.2, nx = m.position.x + Math.sin(h.dir) * sp * dt, nz = m.position.z + Math.cos(h.dir) * sp * dt;
      const ax = nx + Math.sin(h.dir) * 0.7, az = nz + Math.cos(h.dir) * 0.7;
      if (horseBlocked(ax, az)) { h.dir += Math.PI * (0.5 + Math.random()); }
      else { m.position.x = nx; m.position.z = nz; moving = sp; }
      let turn = h.dir - m.rotation.y; turn = Math.atan2(Math.sin(turn), Math.cos(turn)); // shortest way round
      m.rotation.y += turn * Math.min(1, dt * 3);
      ud.neck.rotation.x *= 0.9;
      h.timer -= dt; if (h.timer <= 0) { h.state = 'graze'; h.timer = 2 + Math.random() * 4; }
    } else { // graze (wild) or idle (tamed, waiting for you)
      ud.neck.rotation.x += ((h.state === 'graze' ? 0.95 : 0.1) - ud.neck.rotation.x) * Math.min(1, dt * 3);
      h.timer -= dt;
      if (h.state === 'graze' && h.timer <= 0) { h.state = 'wander'; h.dir = Math.random() * Math.PI * 2; h.timer = 2 + Math.random() * 4; }
    }
    // Legs: gallop / walk cycle while moving, stand still otherwise
    h.gait += dt * Math.min(16, 3 + moving * 1.4);
    const sw = moving > 0.2 ? Math.sin(h.gait) * Math.min(0.7, 0.25 + moving * 0.06) : 0;
    ud.legs[0].rotation.x = sw; ud.legs[3].rotation.x = sw; ud.legs[1].rotation.x = -sw; ud.legs[2].rotation.x = -sw;
    ud.tail.rotation.x = 0.5 + (moving > 0.2 ? 0.35 : Math.sin(E.time * 2 + h.gait) * 0.1);
    m.position.y = moving > 3 ? Math.abs(Math.sin(h.gait)) * 0.08 : 0;
  });

  // Sit the rider in the saddle
  if (E.riding) {
    const h = E.riding, ud = E.player.userData;
    p.y = HORSE_SEAT + h.mesh.position.y;
    E.player.rotation.z = 0;
    if (ud.legs) ud.legs.forEach((l, i) => { l.rotation.x = -0.35; l.rotation.z = (i ? 1 : -1) * 0.55; });
    if (ud.arms && !(E.punch > 0)) { ud.arms[0].rotation.x = -0.7; ud.arms[1].rotation.x = -0.7; } // holding the reins
  }

  // The Ride / Get off button
  if (btn) {
    const near = !E.riding && nearestHorse();
    if (E.riding) { btn.style.display = 'block'; btn.textContent = '🐴 Get off ' + E.riding.name + ' [R]'; }
    else if (near) { btn.style.display = 'block'; btn.textContent = near.tamed ? '🐴 Ride ' + near.name + '! [R]' : '🐴 Ride the wild horse! [R]'; }
    else btn.style.display = 'none';
  }
}
