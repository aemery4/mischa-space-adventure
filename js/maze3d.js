// ════════════════════════════════════════════════════════════════
// js/maze3d.js — Mischa's JUNGLE: village → forest → GIANT MAZE (planet 2)
//
// The adventure has three parts, from bottom to top:
//   1. 🏘️  The village (a safe zone with shops) — you start here.
//   2. 🌲  A thick forest. Follow the dirt trail north to find…
//   3. 🌿  …the torch-lit entrance to a GIANT hedge maze. The 👑 Monkey King
//       waits in his temple in the MIDDLE of the maze. Beat him to unlock
//       the rocket in his throne room!
//
// Fun numbers to change:
//   MAZE_CELLS    — how big the maze is (rooms wide, rooms tall)
//   HEDGE_HEIGHT  — how tall the hedge walls are
//   MAZE_LOOPS    — chance of extra shortcuts (0 = one true path, 0.2 = lots)
//   MAZE_DEAD_END_FIX — how many dead ends get opened up (0 = none = HARD,
//                       1 = all of them = EASY)
//   FOREST_DEPTH  — how far you hike through the forest (in tiles)
//   FOREST_TREES  — how thick the forest is (0.1 = sparse, 0.4 = super thick)
// ════════════════════════════════════════════════════════════════

// Mischa made the maze easier: a bit smaller, more shortcuts, few dead ends
const MAZE_CELLS = { desktop: [20, 14], touch: [14, 10] };
const MAZE_PITCH = 4;        // 3-tile-wide paths + 1-tile hedge
const MAZE_LOOPS = 0.15;
const MAZE_DEAD_END_FIX = 0.85;
const HEDGE_HEIGHT = 1.8;
const FOREST_DEPTH = { desktop: 34, touch: 24 };
const FOREST_TREES = 0.28;

const HEDGE = 21;            // hedge wall tile (solid; drawn by addMazeHedges)
const TRAIL = 22;            // dirt trail through the forest (walkable)
const FTREE = 23;            // forest tree (solid; drawn by addForestTrees)

// Builds the whole level into E.map and returns the level data with the
// creatures and shops moved to fit it (replaces the old hand-made jungle map).
function buildMazeWorld(cfg, data) {
  const touch = (typeof IS_TOUCH !== 'undefined' && IS_TOUCH);
  const [CW, CH] = touch ? MAZE_CELLS.touch : MAZE_CELLS.desktop;
  const P = MAZE_PITCH, W = CW * P + 1;
  const MH = CH * P + 1;                                 // maze height (top part)
  const H = MH + (touch ? FOREST_DEPTH.touch : FOREST_DEPTH.desktop);
  const map = [];
  for (let z = 0; z < H; z++) map.push(new Array(W).fill(HEDGE));
  const rnd = n => Math.floor(Math.random() * n);

  // ── 3. The maze (top part) ─────────────────────────────────────
  const ax = Math.floor((CW - 5) / 2), ay = Math.floor((CH - 4) / 2);
  const arena = { cx0: ax, cx1: ax + 4, cy0: ay, cy1: ay + 3 };  // Monkey King's temple (right in the middle!)
  const inArena = (cx, cy) => cx >= arena.cx0 && cx <= arena.cx1 && cy >= arena.cy0 && cy <= arena.cy1;
  const openCell = (cx, cy) => { for (let dz = 1; dz < P; dz++) for (let dx = 1; dx < P; dx++) map[cy * P + dz][cx * P + dx] = 0; };
  const knock = (cx, cy, dx, dy) => { // remove the hedge between a cell and its neighbour
    if (dx) { const wx = (dx > 0 ? cx + 1 : cx) * P; for (let k = 1; k < P; k++) map[cy * P + k][wx] = 0; }
    else { const wz = (dy > 0 ? cy + 1 : cy) * P; for (let k = 1; k < P; k++) map[wz][cx * P + k] = 0; }
  };
  // The maze entrance is somewhere along the bottom edge, right half
  const gx = Math.floor(CW / 2) + rnd(Math.max(1, Math.floor(CW / 2) - 1));

  // Carve a perfect maze (randomised depth-first search) over every cell
  // except the throne room, so every path connects and nothing is cut off.
  const seen = Array.from({ length: CH }, () => new Array(CW).fill(false));
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const stack = [[gx, CH - 1]]; seen[CH - 1][gx] = true; openCell(gx, CH - 1);
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const nbrs = DIRS.filter(([dx, dy]) => {
      const nx = cx + dx, ny = cy + dy;
      return nx >= 0 && ny >= 0 && nx < CW && ny < CH && !seen[ny][nx] && !inArena(nx, ny);
    });
    if (!nbrs.length) { stack.pop(); continue; }
    const [dx, dy] = nbrs[rnd(nbrs.length)];
    knock(cx, cy, dx, dy);
    seen[cy + dy][cx + dx] = true; openCell(cx + dx, cy + dy); stack.push([cx + dx, cy + dy]);
  }
  // A few extra shortcuts so it's a challenge, not a punishment
  for (let cy = 0; cy < CH; cy++) for (let cx = 0; cx < CW; cx++) {
    if (inArena(cx, cy) || Math.random() > MAZE_LOOPS) continue;
    const [dx, dy] = DIRS[rnd(2) * 2]; // right or down
    const nx = cx + dx, ny = cy + dy;
    if (nx < CW && ny < CH && !inArena(nx, ny)) knock(cx, cy, dx, dy);
  }
  // Open up most dead ends (a room with only one way in) into a neighbour,
  // so you don't keep getting trapped — dead ends are what make mazes hard
  const isOpen = (cx, cy, dx, dy) => dx
    ? map[cy * P + 2][(dx > 0 ? cx + 1 : cx) * P] !== HEDGE
    : map[(dy > 0 ? cy + 1 : cy) * P][cx * P + 2] !== HEDGE;
  const okCell = (cx, cy) => cx >= 0 && cy >= 0 && cx < CW && cy < CH && !inArena(cx, cy);
  for (let cy = 0; cy < CH; cy++) for (let cx = 0; cx < CW; cx++) {
    if (inArena(cx, cy)) continue;
    const exits = DIRS.filter(([dx, dy]) => okCell(cx + dx, cy + dy) && isOpen(cx, cy, dx, dy)).length;
    if (exits !== 1 || Math.random() > MAZE_DEAD_END_FIX) continue;
    const closed = DIRS.filter(([dx, dy]) => okCell(cx + dx, cy + dy) && !isOpen(cx, cy, dx, dy));
    if (closed.length) { const [dx, dy] = closed[rnd(closed.length)]; knock(cx, cy, dx, dy); }
  }

  // Throne room: stone walls (tile 20) with one gate on the south side,
  // a stepped pyramid at the back, and a stone floor (tile 9)
  const x0 = arena.cx0 * P, x1 = (arena.cx1 + 1) * P, z0 = arena.cy0 * P, z1 = (arena.cy1 + 1) * P;
  for (let z = z0 + 1; z < z1; z++) for (let x = x0 + 1; x < x1; x++) map[z][x] = 9;
  for (let x = x0; x <= x1; x++) { map[z0][x] = 20; map[z1][x] = 20; }
  for (let z = z0; z <= z1; z++) { map[z][x0] = 20; map[z][x1] = 20; }
  const cx = (arena.cx0 + 2) * P + 2;                       // gate lines up with a maze path
  for (let x = cx - 1; x <= cx + 1; x++) map[z1][x] = 9;
  const px0 = cx - 4, px1 = cx + 4, pz0 = z0 + 1, pz1 = z0 + 7;
  for (let z = pz0; z <= pz1; z++) for (let x = px0; x <= px1; x++) map[z][x] = 20;
  map[pz1][cx] = 9; // doorway notch

  // ── 1. The village (bottom-left of the forest) ─────────────────
  const vx0 = 1, vx1 = 13, vz0 = H - 12, vz1 = H - 2;
  for (let z = vz0; z <= vz1; z++) for (let x = vx0; x <= vx1; x++) map[z][x] = 7;
  const spawn = { x: Math.floor((vx0 + vx1) / 2), z: Math.floor((vz0 + vz1) / 2) };

  // ── 2. The forest (between the village and the maze) ───────────
  const inForest = (x, z) => z >= MH && z <= H - 2 && x >= 1 && x <= W - 2;
  const inVillage = (x, z) => x >= vx0 && x <= vx1 && z >= vz0 && z <= vz1;
  // Forest edge: a wall of trees around the outside
  for (let z = MH; z < H; z++) { map[z][0] = FTREE; map[z][W - 1] = FTREE; }
  for (let x = 0; x < W; x++) map[H - 1][x] = FTREE;
  for (let z = MH; z <= H - 2; z++) for (let x = 1; x <= W - 2; x++) {
    if (inVillage(x, z)) continue;
    const r = Math.random();
    map[z][x] = r < FOREST_TREES ? FTREE : r < FOREST_TREES + 0.06 ? 2 : r < FOREST_TREES + 0.08 ? 6 : 0;
  }
  // A winding dirt trail from the village up to the maze entrance
  const tx = gx * P + 2;
  for (let x = tx - 1; x <= tx + 1; x++) map[MH - 1][x] = TRAIL;   // open the maze gate
  let wx = spawn.x, wz = vz0 - 1, guard = 0;
  const brush = (bx, bz) => {
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const x = bx + dx, z = bz + dz;
      if (inForest(x, z) && !inVillage(x, z)) map[z][x] = TRAIL;
    }
  };
  while ((wx !== tx || wz !== MH) && guard++ < 20000) {
    brush(wx, wz);
    const r = Math.random();
    if (r < 0.42 && wz > MH) wz--;                                   // north
    else if (r < 0.74 && wx !== tx) wx += tx > wx ? 1 : -1;          // toward the gate
    else wx = Math.max(2, Math.min(W - 3, wx + (Math.random() < 0.5 ? 1 : -1))); // wiggle
  }
  brush(tx, MH);

  // Any forest pocket you couldn't walk to becomes more trees
  // (so nothing — fuel, monkeys — ends up stuck where you can't reach it)
  const solid = new Set(cfg.solid);
  const reach = Array.from({ length: H }, () => new Array(W).fill(false));
  const q = [[spawn.x, spawn.z]]; reach[spawn.z][spawn.x] = true;
  for (let i = 0; i < q.length; i++) {
    const [x, z] = q[i];
    for (const [dx, dz] of DIRS) {
      const nx = x + dx, nz = z + dz;
      if (nx >= 0 && nz >= 0 && nx < W && nz < H && !reach[nz][nx] && !solid.has(map[nz][nx])) { reach[nz][nx] = true; q.push([nx, nz]); }
    }
  }
  for (let z = MH; z < H; z++) for (let x = 0; x < W; x++) if (!reach[z][x] && !solid.has(map[z][x])) map[z][x] = FTREE;

  E.map = map; E.worldOff = 0; E.rows = H; E.cols = W;
  E.spawnTile = spawn;
  E.mazeGate = { x: tx, z: MH - 1 };
  E.temple = { cx, cz: (z0 + z1) / 2, x0, x1, z0, z1, px0, px1, pz0, pz1, bossX: cx + 0.5, bossZ: z1 - 5.5, maze: true };

  // Move the village shops into the village's corners
  const T = cfg.tile;
  const spots = [[vx0 + 1, vz0 + 1], [vx1 - 1, vz0 + 1], [vx0 + 1, vz1 - 1], [vx1 - 1, vz1 - 1]];
  const merchants = (data.VILLAGE_MERCHANTS || []).map((m, i) => {
    const s = spots[i % spots.length];
    return Object.assign({}, m, { x: s[0] * T + T / 2, y: s[1] * T + T / 2 });
  });
  // The old hand-placed items and creatures would land inside hedges, so
  // the level scatters its own along the paths (see sprinkleExtras).
  return Object.assign({}, data, {
    resources: [], monkeys: [], golems: [], lizards: [], panthers: [], parrots: [], bunnies: [],
    VILLAGE_MERCHANTS: merchants
  });
}

// Draw every hedge tile with two instanced meshes (fast, even for thousands)
function addMazeHedges(scene) {
  const spots = [];
  for (let z = 0; z < E.rows; z++) for (let x = 0; x < E.cols; x++) if (E.map[z][x] === HEDGE) spots.push([x, z]);
  if (!spots.length) return;
  const n = spots.length;
  const body = new THREE.InstancedMesh(new THREE.BoxGeometry(1, HEDGE_HEIGHT, 1),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 }), n);
  const top = new THREE.InstancedMesh(new THREE.BoxGeometry(1.06, 0.3, 1.06),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }), n);
  const mtx = new THREE.Matrix4(), col = new THREE.Color();
  spots.forEach(([x, z], i) => {
    const h = 0.92 + Math.random() * 0.16; // slightly uneven, like real hedges
    mtx.makeScale(1, h, 1); mtx.setPosition(x + 0.5, HEDGE_HEIGHT * h / 2, z + 0.5);
    body.setMatrixAt(i, mtx);
    col.setHSL(0.30 + Math.random() * 0.05, 0.55, 0.20 + Math.random() * 0.06); body.setColorAt(i, col);
    mtx.makeScale(1, 1, 1); mtx.setPosition(x + 0.5, HEDGE_HEIGHT * h + 0.05, z + 0.5);
    top.setMatrixAt(i, mtx);
    col.setHSL(0.27 + Math.random() * 0.07, 0.6, 0.30 + Math.random() * 0.08); top.setColorAt(i, col);
  });
  body.castShadow = true; body.receiveShadow = true; top.castShadow = true;
  scene.add(body, top);
}

// Draw every forest tree with instanced trunks + two layers of leaves
function addForestTrees(scene) {
  const spots = [];
  for (let z = 0; z < E.rows; z++) for (let x = 0; x < E.cols; x++) if (E.map[z][x] === FTREE) spots.push([x, z]);
  if (!spots.length) return;
  const n = spots.length;
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.18, 1, 6),
    new THREE.MeshStandardMaterial({ color: 0x5a3a1e, roughness: 1 }), n);
  const low = new THREE.InstancedMesh(new THREE.ConeGeometry(0.62, 1, 7),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }), n);
  const high = new THREE.InstancedMesh(new THREE.ConeGeometry(0.45, 1, 7),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }), n);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), scl = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0), col = new THREE.Color();
  const lowM = [], highM = [], index = new Map();
  spots.forEach(([x, z], i) => {
    const s = 0.8 + Math.random() * 0.55;
    const ox = x + 0.5 + (Math.random() - 0.5) * 0.25, oz = z + 0.5 + (Math.random() - 0.5) * 0.25;
    q.setFromAxisAngle(up, Math.random() * Math.PI * 2);
    m.compose(pos.set(ox, 0.6 * s, oz), q, scl.set(s, 1.2 * s, s)); trunk.setMatrixAt(i, m);
    m.compose(pos.set(ox, 1.55 * s, oz), q, scl.set(s, 1.3 * s, s)); low.setMatrixAt(i, m); lowM.push(m.clone());
    m.compose(pos.set(ox, 2.25 * s, oz), q, scl.set(s, 1.0 * s, s)); high.setMatrixAt(i, m); highM.push(m.clone());
    col.setHSL(0.30 + Math.random() * 0.08, 0.55, 0.22 + Math.random() * 0.08); low.setColorAt(i, col);
    col.offsetHSL(0, 0, 0.06); high.setColorAt(i, col);
    index.set(x + ',' + z, i);
  });
  [trunk, low, high].forEach(o => { o.castShadow = true; scene.add(o); });
  E.forest = { low, high, lowM, highM, index, hidden: new Set() };
}

// Trees between the camera and the player lose their leaves (just the trunk
// shows) so the forest never hides you. They grow back when you walk away.
const _zeroM = new THREE.Matrix4().makeScale(0, 0, 0);
function updateForestCutaway() {
  const f = E.forest; if (!f || !E.player) return;
  const px = Math.floor(E.player.position.x), pz = Math.floor(E.player.position.z);
  const want = new Set();
  for (let z = pz; z <= pz + 3; z++) for (let x = px - 1; x <= px + 1; x++) {  // +z = toward the camera
    const i = f.index.get(x + ',' + z); if (i !== undefined) want.add(i);
  }
  let changed = false;
  f.hidden.forEach(i => { if (!want.has(i)) { f.low.setMatrixAt(i, f.lowM[i]); f.high.setMatrixAt(i, f.highM[i]); f.hidden.delete(i); changed = true; } });
  want.forEach(i => { if (!f.hidden.has(i)) { f.low.setMatrixAt(i, _zeroM); f.high.setMatrixAt(i, _zeroM); f.hidden.add(i); changed = true; } });
  if (changed) { f.low.instanceMatrix.needsUpdate = true; f.high.instanceMatrix.needsUpdate = true; }
}

// Two torch posts mark the way into the maze at the end of the trail
function addMazeEntrance(scene) {
  const g = E.mazeGate; if (!g) return;
  const stone = new THREE.MeshStandardMaterial({ color: 0x6a6258, roughness: 1 });
  [-2, 2].forEach(dx => {
    const x = g.x + dx + 0.5, z = g.z + 1.0;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 2.4, 6), stone);
    post.position.set(x, 1.2, z); post.castShadow = true; scene.add(post);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshStandardMaterial({
      color: 0xffb050, emissive: 0xff6a10, emissiveIntensity: 1.3 }));
    flame.position.set(x, 2.7, z); scene.add(flame);
    const light = new THREE.PointLight(0xff8030, 1.0, 12, 2); light.position.set(x, 2.9, z); scene.add(light);
  });
}

// Put a golden crown on the Monkey King and make him tougher
function crownMonkeyKing() {
  const boss = E.enemies.find(e => e.boss); if (!boss) return;
  const s = boss.size, g = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: 0xffd23a, metalness: 0.7, roughness: 0.3,
    emissive: 0x6a4a00, emissiveIntensity: 0.5, side: THREE.DoubleSide });
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.34 * s, 0.38 * s, 0.2 * s, 14, 1, true), gold));
  const gems = [0xff3050, 0x30a0ff, 0x40ff70];
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.08 * s, 0.28 * s, 6), gold);
    spike.position.set(Math.cos(a) * 0.35 * s, 0.22 * s, Math.sin(a) * 0.35 * s); g.add(spike);
    const gem = new THREE.Mesh(new THREE.SphereGeometry(0.055 * s, 8, 8), new THREE.MeshStandardMaterial({
      color: gems[i % 3], emissive: gems[i % 3], emissiveIntensity: 0.6 }));
    gem.position.set(Math.cos(a) * 0.38 * s, 0, Math.sin(a) * 0.38 * s); g.add(gem);
  }
  g.position.set(0, 1.25 * s, 0.15 * s); // sits on top of his head
  boss.mesh.add(g);
  boss.hp = boss.maxhp = 40;
}

// The rocket waits in the throne room, beside the pyramid
function placeExitInArena() {
  const t = E.temple; if (!E.exit || !t) return;
  const x = t.x0 + 3.5, z = t.z0 + 4.5;
  E.exit.mesh.position.set(x, 0, z); E.exit.x = x; E.exit.z = z;
}
