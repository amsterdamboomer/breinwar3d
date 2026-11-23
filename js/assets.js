// BREINWAR 3D — procedurele art: alles met de hand getekend op canvas, 0 kopiïde assets.
'use strict';
const ASSETS = {};

function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function px(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(x, y, w, h); }
function noise(g, w, h, amt, alpha) {
  for (let i = 0; i < w * h * amt; i++) {
    const v = Math.random() * 60 | 0;
    px(g, Math.random() * w | 0, Math.random() * h | 0, 1, 1, `rgba(${v},${v},${v},${alpha})`);
  }
}

// ───────────────────── MUREN (64x64) ─────────────────────
function texBrick() {
  const c = mkCanvas(64, 64), g = c.getContext('2d');
  px(g, 0, 0, 64, 64, '#3a2018');
  for (let row = 0; row < 8; row++) {
    const off = (row % 2) * 8;
    for (let col = -1; col < 5; col++) {
      const x = col * 16 + off, y = row * 8;
      const t = 90 + Math.random() * 40 | 0;
      px(g, x + 1, y + 1, 14, 6, `rgb(${t},${t * 0.38 | 0},${t * 0.26 | 0})`);
      px(g, x + 1, y + 1, 14, 1, `rgb(${t + 30},${t * 0.4 | 0},${t * 0.28 | 0})`);
    }
  }
  noise(g, 64, 64, 0.5, 0.15); return c;
}
function texStone() {
  const c = mkCanvas(64, 64), g = c.getContext('2d');
  px(g, 0, 0, 64, 64, '#2e2e33');
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
    const t = 95 + Math.random() * 35 | 0;
    px(g, col * 16 + 1, row * 16 + 1, 14, 14, `rgb(${t},${t},${t + 6})`);
    px(g, col * 16 + 1, row * 16 + 1, 14, 2, `rgb(${t + 25},${t + 25},${t + 30})`);
    px(g, col * 16 + 1, row * 16 + 12, 14, 3, `rgb(${t - 30},${t - 30},${t - 26})`);
  }
  noise(g, 64, 64, 0.6, 0.18); return c;
}
function texMetal() {
  const c = mkCanvas(64, 64), g = c.getContext('2d');
  px(g, 0, 0, 64, 64, '#3d4550');
  for (let i = 0; i < 4; i++) { px(g, 0, i * 16, 64, 15, '#4a5462'); px(g, 0, i * 16 + 13, 64, 2, '#2c333c'); }
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    px(g, 4 + j * 16, 4 + i * 16, 2, 2, '#7d8896'); px(g, 5 + j * 16, 5 + i * 16, 1, 1, '#22282f');
  }
  px(g, 0, 0, 64, 2, '#5a6675'); noise(g, 64, 64, 0.4, 0.12); return c;
}
function texWood() {
  const c = mkCanvas(64, 64), g = c.getContext('2d');
  px(g, 0, 0, 64, 64, '#4a3018');
  for (let p = 0; p < 4; p++) {
    const t = 95 + Math.random() * 25 | 0;
    px(g, p * 16 + 1, 0, 14, 64, `rgb(${t},${t * 0.62 | 0},${t * 0.32 | 0})`);
    for (let s = 0; s < 5; s++) px(g, p * 16 + 2 + (Math.random() * 11 | 0), 0, 1, 64, 'rgba(30,15,5,.4)');
    px(g, p * 16, 0, 1, 64, '#241408');
  }
  noise(g, 64, 64, 0.3, 0.1); return c;
}
function texMarble() {
  const c = mkCanvas(64, 64), g = c.getContext('2d');
  px(g, 0, 0, 64, 64, '#2a3a5e');
  for (let i = 0; i < 14; i++) {
    let x = Math.random() * 64, y = Math.random() * 64;
    g.strokeStyle = 'rgba(160,180,220,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < 5; s++) { x += Math.random() * 14 - 7; y += Math.random() * 14; g.lineTo(x, y); }
    g.stroke();
  }
  px(g, 0, 0, 64, 3, '#4a5e8e'); px(g, 0, 61, 64, 3, '#1a2440'); noise(g, 64, 64, 0.3, 0.08); return c;
}
function texDoor(gold, silver) {
  const c = mkCanvas(64, 64), g = c.getContext('2d');
  px(g, 0, 0, 64, 64, gold ? '#8a6a1a' : silver ? '#7a828c' : '#5a3a1a');
  for (let p = 0; p < 2; p++) {
    px(g, 4 + p * 30, 3, 26, 58, gold ? '#b8922e' : silver ? '#9aa4b0' : '#7a5028');
    px(g, 6 + p * 30, 6, 22, 52, gold ? '#a07f24' : silver ? '#8892a0' : '#6a4520');
    for (let s = 0; s < 4; s++) px(g, 6 + p * 30, 8 + s * 13, 22, 2, gold ? '#c8a840' : silver ? '#b0bac6' : '#8a5c30');
  }
  const band = gold ? '#6a5010' : silver ? '#5a626c' : '#3a2410';
  px(g, 0, 10, 64, 5, band); px(g, 0, 46, 64, 5, band);
  for (let i = 0; i < 8; i++) { px(g, 3 + i * 8, 11, 2, 3, '#d8d8d8'); px(g, 3 + i * 8, 47, 2, 3, '#d8d8d8'); }
  px(g, 28, 26, 8, 12, gold ? '#ffd860' : silver ? '#e0e8f0' : '#c8b060');
  px(g, 30, 29, 4, 3, '#222'); noise(g, 64, 64, 0.3, 0.1); return c;
}
function texExit() {
  const c = mkCanvas(64, 64), g = c.getContext('2d');
  px(g, 0, 0, 64, 64, '#1a3a1a');
  px(g, 4, 4, 56, 56, '#245224'); px(g, 6, 6, 52, 52, '#1c401c');
  // schedel
  px(g, 20, 16, 24, 20, '#c8c8b8'); px(g, 24, 36, 16, 6, '#c8c8b8');
  px(g, 24, 22, 6, 6, '#0a0a0a'); px(g, 34, 22, 6, 6, '#0a0a0a');
  px(g, 29, 30, 6, 4, '#0a0a0a');
  for (let i = 0; i < 4; i++) px(g, 25 + i * 4, 37, 2, 4, '#1c401c');
  g.fillStyle = '#5f5'; g.font = 'bold 9px monospace'; g.textAlign = 'center';
  g.fillText('EXIT', 32, 54); noise(g, 64, 64, 0.3, 0.1); return c;
}
function texPush() { const c = texStone(); const g = c.getContext('2d');
  px(g, 0, 0, 64, 2, '#555'); px(g, 0, 62, 64, 2, '#222');
  px(g, 30, 28, 4, 4, '#666'); return c; }

// ───────────────────── SPRITES ─────────────────────
function sprite(w, h, draw) { const c = mkCanvas(w, h), g = c.getContext('2d'); g.imageSmoothingEnabled = false; draw(g); return c; }

function drawSoldier(g, opt) {
  // 16x24 raster, x4 schaal → 64x96
  const S = 4, U = opt.uniform, U2 = opt.dark, SK = '#e0a878', HT = opt.helmet;
  const P = (x, y, w, h, col) => px(g, x * S, y * S, w * S, h * S, col);
  if (opt.corpse) {
    px(g, 4, 76, 56, 12, '#7a1010'); // bloedplas
    P(1, 17, 13, 4, U); P(2, 16, 3, 2, U2); P(11, 16, 3, 2, SK); P(12, 17, 2, 1, '#000');
    return;
  }
  if (opt.dying) {
    P(5, 8, 6, 3, HT); P(5, 11, 6, 3, SK); P(6, 12, 1, 1, '#000'); P(9, 12, 1, 1, '#000');
    P(4, 14, 8, 5, U); P(3, 18, 10, 3, U2); P(2, 15, 2, 3, SK); P(12, 15, 2, 3, SK);
    P(13, 12, 2, 6, '#222'); return;
  }
  // helm + gezicht
  P(4, 0, 8, 2, HT); P(3, 2, 10, 2, HT); P(3, 4, 10, 1, U2);
  P(5, 5, 6, 3, SK); P(5, 6, 1, 1, '#000'); P(10, 6, 1, 1, '#000'); P(6, 8, 4, 1, '#a06840');
  // romp
  P(4, 9, 8, 6, U); P(4, 9, 1, 6, U2); P(11, 9, 1, 6, U2);
  P(5, 9, 6, 1, U2); P(4, 12, 8, 1, '#2a2a24'); P(7, 12, 2, 1, '#c8b060');
  if (opt.armband) P(11, 10, 1, 2, '#c00');
  // armen + wapen in aanslag
  P(2, 9, 2, 4, U); P(12, 9, 2, 4, U);
  P(2, 13, 2, 1, SK); P(12, 13, 2, 1, SK);
  if (opt.fire) { P(1, 12, 3, 3, '#ff0'); P(0, 13, 2, 1, '#f80'); }
  P(1, 11, 14, 1, '#333'); P(12, 10, 1, 3, '#333'); P(13, 10, 1, 1, '#5a3a1a');
  // benen
  P(5, 15, 2, 6, U2); P(9, 15, 2, 6, U2); P(4, 21, 3, 3, '#1a1a1a'); P(9, 21, 3, 3, '#1a1a1a');
}
function drawDog(g, opt) {
  const S = 4, B = '#7a5230', D = '#5a3a20';
  const P = (x, y, w, h, col) => px(g, x * S, y * S, w * S, h * S, col);
  if (opt.corpse) { px(g, 6, 80, 52, 10, '#7a1010'); P(2, 17, 12, 3, B); P(12, 16, 3, 2, D); return; }
  if (opt.dying) { P(2, 14, 10, 3, B); P(11, 12, 4, 3, B); P(14, 13, 1, 1, '#fff'); P(3, 17, 9, 2, D); return; }
  P(1, 12, 10, 4, B); P(0, 11, 2, 2, B); // romp + staart
  P(10, 9, 5, 4, B); P(14, 10, 2, 2, B); // kop
  P(10, 8, 2, 2, D); // oor
  P(13, 10, 1, 1, '#000'); P(14, 12, 2, 1, '#fff'); // oog + tanden
  P(2, 16, 2, 4, D); P(5, 16, 2, 4, D); P(9, 16, 2, 4, D); P(11, 16, 2, 4, D); // poten
  if (opt.fire) P(15, 12, 2, 2, '#f00');
}

function itemSprite(draw) { return sprite(64, 64, draw); }
const ITEMS = {
  health: itemSprite(g => { px(g, 12, 20, 40, 36, '#ddd'); px(g, 14, 22, 36, 32, '#fff');
    px(g, 28, 26, 8, 24, '#d22'); px(g, 20, 34, 24, 8, '#d22'); }),
  medkit: itemSprite(g => { px(g, 10, 24, 44, 32, '#eee'); px(g, 24, 18, 16, 8, '#bbb');
    px(g, 28, 28, 8, 22, '#d22'); px(g, 21, 35, 22, 8, '#d22'); px(g, 10, 24, 44, 4, '#fff'); }),
  ammo: itemSprite(g => { px(g, 14, 32, 36, 24, '#4a5a2a'); px(g, 14, 32, 36, 4, '#6a7a3a');
    for (let i = 0; i < 4; i++) px(g, 18 + i * 8, 24, 4, 10, '#c8a840'); }),
  ammoBox: itemSprite(g => { px(g, 8, 26, 48, 30, '#5a4020'); px(g, 8, 26, 48, 5, '#7a5a30');
    px(g, 10, 30, 44, 4, '#3a2810'); for (let i = 0; i < 5; i++) px(g, 12 + i * 9, 20, 5, 8, '#c8a840'); }),
  knife: itemSprite(g => { px(g, 14, 40, 26, 5, '#c8ccd0'); px(g, 38, 38, 4, 9, '#e8eef4');
    px(g, 42, 39, 10, 7, '#5a3a1a'); }),
  pistol: itemSprite(g => { px(g, 14, 34, 30, 7, '#3a3a40'); px(g, 20, 41, 8, 12, '#5a3a1a');
    px(g, 14, 34, 30, 2, '#6a6a74'); }),
  shotgun: itemSprite(g => { px(g, 8, 36, 40, 5, '#2a2a30'); px(g, 8, 41, 40, 3, '#4a3018');
    px(g, 40, 38, 14, 8, '#5a3a1a'); px(g, 8, 36, 40, 2, '#5a5a64'); }),
  chaingun: itemSprite(g => { px(g, 10, 34, 34, 10, '#3a4048'); px(g, 6, 36, 8, 6, '#22282e');
    px(g, 44, 36, 12, 6, '#555d66'); px(g, 10, 34, 34, 2, '#6a7480'); }),
  treasure: itemSprite(g => { px(g, 14, 40, 36, 8, '#c89020'); px(g, 18, 32, 28, 8, '#e0a830');
    px(g, 22, 24, 20, 8, '#f8c040'); px(g, 24, 25, 6, 2, '#fff'); px(g, 16, 41, 8, 2, '#ffe080'); }),
  treasureBig: itemSprite(g => { px(g, 16, 44, 32, 6, '#c89020'); px(g, 20, 20, 24, 24, '#e0a830');
    px(g, 24, 14, 16, 8, '#f0b838'); px(g, 26, 24, 4, 4, '#000'); px(g, 34, 24, 4, 4, '#000');
    px(g, 22, 22, 4, 2, '#ffe080'); px(g, 18, 46, 10, 2, '#ffe080'); }),
  life: itemSprite(g => { px(g, 18, 18, 28, 32, '#3a8a3a'); px(g, 22, 14, 20, 6, '#2a6a2a');
    px(g, 24, 26, 5, 5, '#000'); px(g, 36, 26, 5, 5, '#000'); px(g, 26, 38, 12, 4, '#000'); }),
  keyGold: itemSprite(g => { px(g, 20, 16, 16, 16, '#f8c040'); px(g, 25, 21, 6, 6, '#7a5010');
    px(g, 26, 30, 5, 22, '#f8c040'); px(g, 31, 44, 8, 4, '#f8c040'); px(g, 31, 36, 6, 4, '#f8c040'); }),
  keySilver: itemSprite(g => { px(g, 20, 16, 16, 16, '#d0d8e0'); px(g, 25, 21, 6, 6, '#5a626c');
    px(g, 26, 30, 5, 22, '#d0d8e0'); px(g, 31, 44, 8, 4, '#d0d8e0'); px(g, 31, 36, 6, 4, '#d0d8e0'); }),
  rush: itemSprite(g => { g.fillStyle = '#ffd030'; g.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 10 : 26, a = Math.PI / 5 * i - Math.PI / 2;
      g[i ? 'lineTo' : 'moveTo'](32 + Math.cos(a) * r, 34 + Math.sin(a) * r); }
    g.closePath(); g.fill(); g.fillStyle = '#fff'; g.fillRect(29, 24, 5, 5); }),
};

// ───────────────────── WAPEN-MODELLEN (onderin beeld) ─────────────────────
function weaponModel(kind) {
  return sprite(160, 120, g => {
    if (kind === 'knife') {
      px(g, 96, 30, 14, 60, '#c8ccd0'); px(g, 104, 30, 6, 60, '#eef4fa'); px(g, 96, 88, 22, 30, '#5a3a1a');
      px(g, 92, 84, 30, 6, '#c8a840');
    } else if (kind === 'pistol') {
      px(g, 66, 20, 26, 52, '#3a3a40'); px(g, 66, 20, 26, 5, '#6a6a74'); px(g, 74, 12, 10, 10, '#2a2a30');
      px(g, 60, 70, 34, 46, '#5a3a1a'); px(g, 60, 70, 34, 6, '#7a5028'); px(g, 94, 60, 12, 16, '#3a3a40');
    } else if (kind === 'shotgun') {
      px(g, 62, 8, 12, 74, '#2a2a30'); px(g, 78, 8, 12, 74, '#34343c');
      px(g, 62, 8, 4, 74, '#5a5a64'); px(g, 78, 8, 4, 74, '#5a5a64');
      px(g, 58, 56, 36, 14, '#4a3018'); px(g, 58, 56, 36, 4, '#6a4520');
      px(g, 66, 80, 40, 40, '#5a3a1a'); px(g, 100, 96, 24, 24, '#5a3a1a');
    } else if (kind === 'chaingun') {
      px(g, 56, 26, 48, 40, '#3a4048'); px(g, 56, 26, 48, 6, '#6a7480');
      for (let i = 0; i < 3; i++) { px(g, 62 + i * 14, 4, 10, 26, '#555d66'); px(g, 62 + i * 14, 4, 3, 26, '#8a94a0'); }
      px(g, 56, 66, 48, 12, '#22282e'); px(g, 70, 78, 24, 42, '#5a3a1a'); px(g, 94, 60, 16, 30, '#3a4048');
    }
  });
}
function muzzleFlash() {
  return sprite(90, 90, g => {
    g.fillStyle = '#ffe060'; g.beginPath();
    for (let i = 0; i < 16; i++) { const r = i % 2 ? 10 : 40, a = Math.PI / 8 * i;
      g[i ? 'lineTo' : 'moveTo'](45 + Math.cos(a) * r, 45 + Math.sin(a) * r); }
    g.closePath(); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(45, 45, 14, 0, 7); g.fill();
  });
}

// ───────────────────── HUD ─────────────────────
function face(variant) {
  return sprite(32, 32, g => {
    px(g, 6, 4, 20, 24, '#e0a878'); px(g, 6, 2, 20, 6, '#6b4a2a'); px(g, 4, 6, 2, 10, '#6b4a2a'); px(g, 26, 6, 2, 10, '#6b4a2a');
    if (variant === 'dead') {
      g.strokeStyle = '#600'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(9, 11); g.lineTo(15, 17); g.moveTo(15, 11); g.lineTo(9, 17);
      g.moveTo(17, 11); g.lineTo(23, 17); g.moveTo(23, 11); g.lineTo(17, 17); g.stroke();
      px(g, 12, 22, 8, 3, '#600'); return;
    }
    px(g, 9, 12, 4, 4, '#000'); px(g, 19, 12, 4, 4, '#000'); px(g, 14, 16, 4, 4, '#c88858');
    px(g, 11, 23, 10, 2, '#804020');
    if (variant === 'hurt') {
      px(g, 6, 4, 20, 24, 'rgba(200,0,0,.35)'); px(g, 9, 12, 4, 4, '#800'); px(g, 19, 12, 4, 4, '#800');
      px(g, 8, 8, 2, 8, '#c00'); px(g, 22, 10, 2, 6, '#c00'); px(g, 11, 23, 10, 2, '#a00');
    }
    if (variant === 'grin') { px(g, 10, 22, 12, 3, '#fff'); px(g, 10, 22, 12, 1, '#804020'); }
  });
}
function icon(kind) {
  return sprite(16, 16, g => {
    if (kind === 'ammo') { px(g, 5, 2, 6, 9, '#c8a840'); px(g, 5, 11, 6, 4, '#8a6a20'); px(g, 5, 2, 6, 2, '#e8d070'); }
    if (kind === 'health') { px(g, 2, 2, 12, 12, '#eee'); px(g, 6, 4, 4, 8, '#d22'); px(g, 4, 6, 8, 4, '#d22'); }
    if (kind === 'keyGold') { px(g, 3, 2, 6, 6, '#f8c040'); px(g, 5, 4, 2, 2, '#7a5010'); px(g, 5, 8, 2, 7, '#f8c040'); px(g, 7, 11, 4, 2, '#f8c040'); }
    if (kind === 'keySilver') { px(g, 3, 2, 6, 6, '#d0d8e0'); px(g, 5, 4, 2, 2, '#5a626c'); px(g, 5, 8, 2, 7, '#d0d8e0'); px(g, 7, 11, 4, 2, '#d0d8e0'); }
    if (kind === 'life') { px(g, 4, 3, 8, 10, '#3a8a3a'); px(g, 5, 6, 2, 2, '#000'); px(g, 9, 6, 2, 2, '#000'); px(g, 6, 10, 4, 2, '#000'); }
    if (kind === 'sound') { px(g, 2, 6, 4, 4, '#fc3'); px(g, 6, 4, 2, 8, '#fc3'); px(g, 9, 6, 2, 4, '#fc3'); px(g, 12, 3, 2, 10, '#fc3'); }
    if (kind === 'mute') { px(g, 2, 6, 4, 4, '#844'); px(g, 6, 4, 2, 8, '#844'); px(g, 10, 5, 2, 2, '#f55'); px(g, 12, 7, 2, 2, '#f55'); px(g, 10, 9, 2, 2, '#f55'); }
  });
}

// ───────────────────── BUILD ─────────────────────
(function build() {
  ASSETS.tex = {
    brick: texBrick(), stone: texStone(), metal: texMetal(), wood: texWood(), marble: texMarble(),
    door: texDoor(false, false), doorGold: texDoor(true, false), doorSilver: texDoor(false, true),
    exit: texExit(), push: texPush(),
  };
  ASSETS.spr = {
    guard: sprite(64, 96, g => drawSoldier(g, { uniform: '#5a6156', dark: '#454b42', helmet: '#6b705c' })),
    guardFire: sprite(64, 96, g => drawSoldier(g, { uniform: '#5a6156', dark: '#454b42', helmet: '#6b705c', fire: true })),
    guardDie: sprite(64, 96, g => drawSoldier(g, { uniform: '#5a6156', dark: '#454b42', helmet: '#6b705c', dying: true })),
    guardCorpse: sprite(64, 96, g => drawSoldier(g, { uniform: '#5a6156', dark: '#454b42', helmet: '#6b705c', corpse: true })),
    officer: sprite(64, 96, g => drawSoldier(g, { uniform: '#2b2b33', dark: '#1c1c22', helmet: '#232328', armband: true })),
    officerFire: sprite(64, 96, g => drawSoldier(g, { uniform: '#2b2b33', dark: '#1c1c22', helmet: '#232328', armband: true, fire: true })),
    officerDie: sprite(64, 96, g => drawSoldier(g, { uniform: '#2b2b33', dark: '#1c1c22', helmet: '#232328', dying: true })),
    officerCorpse: sprite(64, 96, g => drawSoldier(g, { uniform: '#2b2b33', dark: '#1c1c22', helmet: '#232328', corpse: true })),
    dog: sprite(64, 80, g => drawDog(g, {})),
    dogFire: sprite(64, 80, g => drawDog(g, { fire: true })),
    dogDie: sprite(64, 80, g => drawDog(g, { dying: true })),
    dogCorpse: sprite(64, 80, g => drawDog(g, { corpse: true })),
  };
  ASSETS.items = ITEMS;
  ASSETS.wp = {
    knife: weaponModel('knife'), pistol: weaponModel('pistol'),
    shotgun: weaponModel('shotgun'), chaingun: weaponModel('chaingun'), flash: muzzleFlash(),
  };
  ASSETS.face = { ok: face('ok'), hurt: face('hurt'), grin: face('grin'), dead: face('dead') };
  ASSETS.icon = { ammo: icon('ammo'), health: icon('health'), keyGold: icon('keyGold'),
    keySilver: icon('keySilver'), life: icon('life'), sound: icon('sound'), mute: icon('mute') };
})();
