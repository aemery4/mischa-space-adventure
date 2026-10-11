// ════════════════════════════════════════════════════════════════
// js/maze3d.js — Mischa's GIANT JUNGLE MAZE (planet 2)
//
// The whole jungle is one huge hedge maze. You start in the village
// clearing (bottom-left corner) and the Monkey King waits in his temple
// throne room in the MIDDLE of the maze. Beat him to unlock the rocket!
//
// Fun numbers to change:
//   MAZE_CELLS   — how big the maze is (rooms wide, rooms tall)
//   HEDGE_HEIGHT — how tall the hedge walls are
//   MAZE_LOOPS   — chance of extra shortcuts (0 = one true path, 0.2 = lots)
// ════════════════════════════════════════════════════════════════

const MAZE_CELLS = { desktop: [24, 18], touch: [16, 12] };
const MAZE_PITCH = 4;        // 3-tile-wide paths + 1-tile hedge
const MAZE_LOOPS = 0.06;
const HEDGE = 21;            // hedge wall tile (solid; drawn by addMazeHedges)
const HEDGE_HEIGHT = 1.8;

// Builds the maze into E.map and returns the level data with the creatures
// and shops moved to fit it (the maze replaces the old hand-made jungle map).
function buildMazeWorld(cfg, data) {
  const touch = (typeof IS_TOUCH !== 'undefined' && IS_TOUCH);
  const [CW, CH] = touch ? MAZE_CELLS.touch : MAZE_CELLS.desktop;
  const P = MAZE_PITCH, W = CW * P + 1, H = CH * P + 1;
  const map = [];
  for (let z = 0; z < H; z++) map.push(new Array(W).fill(HEDGE));

  // Special rooms, measured in maze cells
  const ax = Math.floor((CW - 5) / 2), ay = Math.floor((CH - 4) / 2);
  const arena = { cx0: ax, cx1: ax + 4, cy0: ay, cy1: ay + 3 };  // Monkey King's temple (right in the middle!)
  const start = { cx0: 0, cx1: 2, cy0: CH - 3, cy1: CH - 1 };  // village clearing (bottom-left)
  const inArena = (cx, cy) => cx >= arena.cx0 && cx <= arena.cx1 && cy >= arena.cy0 && cy <= arena.cy1;
  const openCell = (cx, cy) => { for (let dz = 1; dz < P; dz++) for (let dx = 1; dx < P; dx++) map[cy * P + dz][cx * P + dx] = 0; };
  const knock = (cx, cy, dx, dy) => { // remove the hedge between a cell and its neighbour
    if (dx) { const wx = (dx > 0 ? cx + 1 : cx) * P; for (let k = 1; k < P; k++) map[cy * P + k][wx] = 0; }
    else { const wz = (dy > 0 ? cy + 1 : cy) * P; for (let k = 1; k < P; k++) map[wz][cx * P + k] = 0; }
  };

  // Carve a perfect maze (randomised depth-first search) over every cell
  // except the throne room, so every path connects and nothing is cut off.
  const seen = Array.from({ length: CH }, () => new Array(CW).fill(false));
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const stack = [[0, CH - 1]]; seen[CH - 1][0] = true; openCell(0, CH - 1);
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const nbrs = DIRS.filter(([dx, dy]) => {
      const nx = cx + dx, ny = cy + dy;
      return nx >= 0 && ny >= 0 && nx < CW && ny < CH && !seen[ny][nx] && !inArena(nx, ny);
    });
    if (!nbrs.length) { stack.pop(); continue; }
    const [dx, dy] = nbrs[Math.floor(Math.random() * nbrs.length)];
    knock(cx, cy, dx, dy);
    seen[cy + dy][cx + dx] = true; openCell(cx + dx, cy + dy); stack.push([cx + dx, cy + dy]);
  }
  // A few extra shortcuts so it's a challenge, not a punishment
  for (let cy = 0; cy < CH; cy++) for (let cx = 0; cx < CW; cx++) {
    if (inArena(cx, cy) || Math.random() > MAZE_LOOPS) continue;
    const [dx, dy] = DIRS[Math.floor(Math.random() * 2) * 2]; // right or down
    const nx = cx + dx, ny = cy + dy;
    if (nx < CW && ny < CH && !inArena(nx, ny)) knock(cx, cy, dx, dy);
  }

  // Village clearing: a wooden safe-zone platform (tile 7) with the shops
  const sx0 = start.cx0 * P + 1, sx1 = (start.cx1 + 1) * P - 1;
  const sz0 = start.cy0 * P + 1, sz1 = (start.cy1 + 1) * P - 1;
  for (let z = sz0; z <= sz1; z++) for (let x = sx0; x <= sx1; x++) map[z][x] = 7;

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

  E.map = map; E.worldOff = 0; E.rows = H; E.cols = W;
  E.spawnTile = { x: Math.floor((sx0 + sx1) / 2), z: Math.floor((sz0 + sz1) / 2) };
  E.temple = { cx, cz: (z0 + z1) / 2, x0, x1, z0, z1, px0, px1, pz0, pz1, bossX: cx + 0.5, bossZ: z1 - 5.5, maze: true };

  // Move the village shops into the clearing's corners
  const T = cfg.tile;
  const spots = [[sx0 + 1, sz0 + 1], [sx1 - 1, sz0 + 1], [sx0 + 1, sz1 - 1], [sx1 - 1, sz1 - 1]];
  const merchants = (data.VILLAGE_MERCHANTS || []).map((m, i) => {
    const s = spots[i % spots.length];
    return Object.assign({}, m, { x: s[0] * T + T / 2, y: s[1] * T + T / 2 });
  });
  // The old hand-placed items and creatures would land inside hedges, so
  // the maze scatters its own along the paths (see sprinkleExtras).
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
