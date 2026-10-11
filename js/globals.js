

// ════════════════════════════════════════
// js/globals.js
// ════════════════════════════════════════
// ── GLOBALS ───────────────────────────────────────────
// ── SAVE ──────────────────────────────────────────────
// ❤️ How much health you start with (Mischa's idea: MORE HEALTH! was 100)
const BASE_MAX_HP = 200;
const DEF={hp:BASE_MAX_HP,maxHp:BASE_MAX_HP,hpBase:BASE_MAX_HP,lives:3,resources:{rock:0,plant:0,crystal:0,banana:0,fuel:0},items:[],planetsCleared:[],bossWins:{},currentPlanet:0,freePlay:false,skin:'default',spaceCoins:0,pet:null,unlockedPets:[],collectibles:{},music:null,homePlanet:{buildings:[],minigameHighScore:0}};
let save=JSON.parse(JSON.stringify(DEF));
let gamePaused=false, animFrameId=null;

// ════════════════════════════════════════
// js/save.js
// ════════════════════════════════════════
// ── SAVE ──────────────────────────────────────────────