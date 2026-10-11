// ════════════════════════════════════════════════════════════════
// js/healthbar3d.js — ❤️ Health bar over your astronaut (Mischa's idea!)
//
// A little health bar floats above your astronaut's head on every level.
// Green when you're healthy, yellow when you're hurt, red when you're in
// danger — and it flashes red whenever something hits you.
//
// Fun things to change: HPBAR_WIDTH, HPBAR_HEIGHT, HPBAR_ABOVE (how high
// above your head it floats).
// ════════════════════════════════════════════════════════════════

const HPBAR_WIDTH = 60;     // pixels
const HPBAR_HEIGHT = 9;     // pixels
const HPBAR_ABOVE = 1.85;   // how high above the ground (your head is ~1.4)

const HPBAR_CSS = `
#playerHp { position:absolute; z-index:38; pointer-events:none; display:none; transform:translate(-50%,-100%);
  width:${HPBAR_WIDTH}px; height:${HPBAR_HEIGHT}px; background:rgba(0,0,0,0.75); border:2px solid #111;
  border-radius:5px; box-shadow:0 0 4px rgba(0,0,0,0.8); overflow:hidden; }
#playerHp .hp-fill { height:100%; width:100%; border-radius:3px; transition:width 0.2s, background-color 0.3s; }
#playerHp.hit { animation:hpHit 0.35s ease-out; }
@keyframes hpHit { 0% { border-color:#fff; box-shadow:0 0 12px #ff2020; } 100% { border-color:#111; } }
`;

function playerHpEl() {
  let el = document.getElementById('playerHp');
  if (el) return el;
  const view = document.getElementById('view3d'); if (!view) return null;
  const style = document.createElement('style'); style.textContent = HPBAR_CSS; document.head.appendChild(style);
  el = document.createElement('div');
  el.id = 'playerHp';
  el.innerHTML = '<div class="hp-fill"></div>';
  view.appendChild(el);
  return el;
}

const _hpPos = new THREE.Vector3();
let _hpLast = null;
function updatePlayerHealthBar() {
  const el = playerHpEl(); if (!el) return;
  if (!E.player || !E.running || !E.camera || !E.renderer) { el.style.display = 'none'; return; }
  // Find where the spot above your head lands on the screen
  const p = E.player.position;
  _hpPos.set(p.x, p.y + HPBAR_ABOVE, p.z).project(E.camera);
  if (_hpPos.z > 1) { el.style.display = 'none'; return; }
  const cv = E.renderer.domElement;
  const sx = cv.offsetLeft + (_hpPos.x * 0.5 + 0.5) * cv.clientWidth;
  const sy = cv.offsetTop + (-_hpPos.y * 0.5 + 0.5) * cv.clientHeight;
  el.style.display = 'block';
  el.style.left = sx.toFixed(1) + 'px';
  el.style.top = sy.toFixed(1) + 'px';
  // Fill + colour from your health
  const max = save.maxHp || 100, hp = Math.max(0, Math.min(max, save.hp));
  if (hp !== _hpLast) {
    const f = hp / max, fill = el.firstChild;
    fill.style.width = (f * 100).toFixed(1) + '%';
    fill.style.backgroundColor = f > 0.6 ? '#3ee05a' : f > 0.3 ? '#ffd23a' : '#ff3b3b';
    if (_hpLast !== null && hp < _hpLast) { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); }
    _hpLast = hp;
  }
}
