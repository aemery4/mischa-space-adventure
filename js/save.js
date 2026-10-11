function persist(){
  try{localStorage.setItem('sga3',JSON.stringify(save));}catch(e){}
  // Show save indicator
  const si=document.getElementById('saveIndicator');
  if(si){si.style.opacity='1';si.textContent='💾 Saved!';clearTimeout(si._t);si._t=setTimeout(()=>{si.style.opacity='0';},1500);}
}
function loadSave(){try{const s=localStorage.getItem('sga3');if(s){
  const old=JSON.parse(s);
  save=Object.assign(JSON.parse(JSON.stringify(DEF)),old);
  // Saves from before "more health": give the bonus once (keeps any upgrades you bought)
  if(!old.hpBase||old.hpBase<BASE_MAX_HP){
    save.maxHp=(old.maxHp||100)+(BASE_MAX_HP-(old.hpBase||100));
    save.hp=save.maxHp; save.hpBase=BASE_MAX_HP; persist();
  }
}}catch(e){}}

// ════════════════════════════════════════
// js/hud.js
// ════════════════════════════════════════
// ── HUD ───────────────────────────────────────────────