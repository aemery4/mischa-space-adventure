// ════════════════════════════════════════════════════════════════
// js/compass3d.js — 🧭 Boss Compass (Mischa's idea!)
//
// A compass in the top-right corner of every level. The red needle always
// points to the BOSS, with its name and how far away it is underneath.
// When there's no boss (or you've beaten it) the needle turns green and
// points to the 🚀 rocket instead, so you always know where to go.
//
// Fun things to change: COMPASS_SIZE, or the needle colours in the CSS below.
// ════════════════════════════════════════════════════════════════

const COMPASS_SIZE = 66; // dial size in pixels

const COMPASS_CSS = `
#compass { position:absolute; top:46px; right:10px; z-index:41; display:none; flex-direction:column;
  align-items:center; gap:3px; pointer-events:none; }
#compass .cmp-dial { width:${COMPASS_SIZE}px; height:${COMPASS_SIZE}px; border-radius:50%; position:relative;
  background:radial-gradient(circle, #1d2c48 0%, #0b1322 75%); border:3px solid #d4aa48;
  box-shadow:0 0 8px rgba(0,0,0,0.7), inset 0 0 6px rgba(0,0,0,0.8); }
#compass .cmp-n { position:absolute; top:2px; left:50%; transform:translateX(-50%); font-size:10px;
  font-weight:bold; color:#ffd76a; }
#compass .cmp-rot { position:absolute; inset:0; }
#compass .cmp-tip { position:absolute; left:50%; bottom:50%; margin-left:-7px; width:0; height:0;
  border-left:7px solid transparent; border-right:7px solid transparent; border-bottom:25px solid #ff3b3b; }
#compass .cmp-tail { position:absolute; left:50%; top:50%; margin-left:-5px; width:0; height:0;
  border-left:5px solid transparent; border-right:5px solid transparent; border-top:16px solid #dfe6f0; }
#compass .cmp-hub { position:absolute; left:50%; top:50%; width:8px; height:8px; margin:-4px 0 0 -4px;
  border-radius:50%; background:#ffd76a; }
#compass .cmp-label { background:rgba(0,0,0,0.7); color:#fff; font-size:11px; font-weight:bold;
  padding:2px 7px; border-radius:8px; white-space:nowrap; }
#compass.rocket .cmp-tip { border-bottom-color:#4dff8a; }
#compass.close .cmp-dial { animation:cmpPulse 0.8s ease-in-out infinite alternate; }
@keyframes cmpPulse { from { box-shadow:0 0 6px #ff4040; } to { box-shadow:0 0 18px #ff4040; } }
`;

function compassEl() {
  let el = document.getElementById('compass');
  if (el) return el;
  const view = document.getElementById('view3d'); if (!view) return null;
  const style = document.createElement('style'); style.textContent = COMPASS_CSS; document.head.appendChild(style);
  el = document.createElement('div');
  el.id = 'compass';
  el.innerHTML = '<div class="cmp-dial"><div class="cmp-n">N</div>' +
    '<div class="cmp-rot"><div class="cmp-tip"></div><div class="cmp-tail"></div></div>' +
    '<div class="cmp-hub"></div></div><div class="cmp-label"></div>';
  view.appendChild(el);
  return el;
}

// What the compass points at: the boss if one is alive, otherwise the rocket
function compassTarget() {
  const boss = (E.enemies || []).find(e => e.boss);
  if (boss) {
    const name = (typeof BOSS_NAME !== 'undefined' && BOSS_NAME[boss.species]) || '👹 Boss';
    return { x: boss.mesh.position.x, z: boss.mesh.position.z, name, boss: true };
  }
  if (E.exit) return { x: E.exit.x, z: E.exit.z, name: '🚀 Rocket', boss: false };
  return null;
}

let _cmpText = '';
function updateCompass() {
  const el = compassEl(); if (!el) return;
  const t = E.player && E.running ? compassTarget() : null;
  if (!t || E.interior || (E.cfg && E.cfg.home)) { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  const p = E.player.position, dx = t.x - p.x, dz = t.z - p.z;
  const dist = Math.hypot(dx, dz);
  // The camera always faces north (-z), so "up" on the screen is north
  const ang = Math.atan2(dx, -dz);
  el.querySelector('.cmp-rot').style.transform = 'rotate(' + ang.toFixed(3) + 'rad)';
  el.classList.toggle('rocket', !t.boss);
  el.classList.toggle('close', t.boss && dist < 8);
  const text = dist < 4 ? t.name + ' is right here!' : t.name + ' · ' + Math.round(dist) + 'm';
  if (text !== _cmpText) { _cmpText = text; el.querySelector('.cmp-label').textContent = text; }
}
