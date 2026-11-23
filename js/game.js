// BREINWAR 3D — engine & gameplay: raycaster, vijanden, wapens, items, HUD.
'use strict';
const W = 480, H = 300, HUD_H = 44, VH = H - HUD_H;
const WALLCH = { '#': 'brick', 'S': 'stone', 'M': 'metal', 'W': 'wood', 'B': 'marble' };
const DOORCH = { 'D': 'door', 'G': 'doorGold', 'V': 'doorSilver', 'P': 'push' };
const ITEMSPR = {
  health: 'health', medkit: 'medkit', ammo: 'ammo', ammoBox: 'ammoBox', knife: 'knife',
  pistol: 'pistol', shotgun: 'shotgun', chaingun: 'chaingun', treasure: 'treasure',
  treasureBig: 'treasureBig', life: 'life', keyGold: 'keyGold', keySilver: 'keySilver', rush: 'rush',
};
const CHAR2ITEM = {
  '+': ['health', 'health'], 'H': ['medkit', 'medkit'], 'a': ['ammo', 'ammo'], 'A': ['ammoBox', 'ammoBox'],
  'k': ['knife', 'knife'], 'p': ['pistol', 'pistol'], 's': ['shotgun', 'shotgun'], 'c': ['chaingun', 'chaingun'],
  't': ['treasure', 'treasure'], 'T': ['treasureBig', 'treasureBig'], 'L': ['life', 'life'],
  'R': ['rush', 'rush'], 'y': ['keyGold', 'keyGold'], 'v': ['keySilver', 'keySilver'],
};
const ENEMY_KIND = {
  g: { hp: 34, speed: 1.7, dmg: 8, cd: 1.15, score: 100, spr: 'guard', scale: 0.92 },
  o: { hp: 60, speed: 1.9, dmg: 13, cd: 0.75, score: 200, spr: 'officer', scale: 0.96 },
  d: { hp: 18, speed: 3.3, dmg: 9, cd: 0.9, score: 50, spr: 'dog', scale: 0.55, melee: true },
};
const WEAPONS = [
  { name: 'MES', short: 'MES', key: 'knife', dmg: 34, rate: 0.55, auto: false, use: 0, range: 1.5, spread: 0, snd: 'knife' },
  { name: 'PISTOOL', short: 'PIST', key: 'pistol', dmg: 16, rate: 0.3, auto: false, use: 1, range: 26, spread: 0.02, snd: 'pistol' },
  { name: 'SHOTGUN', short: 'SHOT', key: 'shotgun', dmg: 13, pellets: 7, rate: 0.85, auto: false, use: 1, range: 14, spread: 0.1, snd: 'shotgun' },
  { name: 'MACHINEGUN', short: 'MG42', key: 'chaingun', dmg: 9, rate: 0.095, auto: true, use: 1, range: 22, spread: 0.055, snd: 'mg' },
];
const angDiff = (a, b) => { let d = (a - b) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };

class Game {
  constructor(canvas) {
    this.cv = canvas; this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.keys = {}; this.state = 'menu'; this.onState = () => {};
    this.showMap = false; this.time = 0;
    this._bindInput();
  }

  // ── state ────────────────────────────────────────────────────────────
  setState(s) { this.state = s; this.onState(s); }
  newGame() {
    this.score = 0; this.lives = 3; this.levelIdx = 0;
    this.inv = { owned: [true, true, false, false], ammo: 50, keys: { g: false, s: false }, weapon: 1 };
    this.loadLevel(0); this.setState('intro');
  }
  loadLevel(idx, keepInv) {
    const L = LEVELS[idx]; this.level = L;
    this.grid = L.map.split('\n').map(r => r.split(''));
    this.h = this.grid.length; this.w = this.grid[0].length;
    this.doors = {}; this.items = []; this.enemies = [];
    this.secretsTotal = 0; this.secretsFound = 0; this.kills = 0; this.enemiesTotal = 0;
    this.levelTime = 0;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const ch = this.grid[y][x];
      if (DOORCH[ch]) this.doors[x + ',' + y] = { open: 0, on: false, locked: ch === 'G' ? 'g' : ch === 'V' ? 's' : null, push: ch === 'P' };
      if (ch === 'P') this.secretsTotal++;
      if (ch === '@') { this.px = x + 0.5; this.py = y + 0.5; this.ang = 0; this.grid[y][x] = '.'; }
      if (CHAR2ITEM[ch]) { this.items.push({ x: x + 0.5, y: y + 0.5, type: CHAR2ITEM[ch][0], taken: false }); this.grid[y][x] = '.'; }
      if (ENEMY_KIND[ch]) {
        const k = ENEMY_KIND[ch];
        this.enemies.push({ x: x + 0.5, y: y + 0.5, kind: ch, ...k, cdMax: k.cd, hp: k.hp, state: 'idle',
          alert: false, cd: 0, painT: 0, fireT: 0, dieT: 0, face: 0 });
        this.enemiesTotal++; this.grid[y][x] = '.';
      }
    }
    if (!keepInv) this.inv = this.inv || { owned: [true, true, false, false], ammo: 50, keys: { g: false, s: false }, weapon: 1 };
    this.health = 100; this.rushT = 0; this.invulnT = 2; this.dmgFlash = 0; this.flashT = 0;
    this.fireCd = 0; this.bob = 0; this.moveAmt = 0; this.msgT = 0; this.firing = false;
    this.zbuf = new Float32Array(W);
  }
  beginPlay() { this.setState('play'); this._lock(); }
  pause() { if (this.state === 'play') this.setState('pause'); }
  resume() { this.setState('play'); this._lock(); }
  respawn() { this.loadLevel(this.levelIdx, true); this.setState('play'); this._lock(); }
  nextLevel() {
    this.levelIdx++;
    if (this.levelIdx >= LEVELS.length) { this.setState('win'); return; }
    this.loadLevel(this.levelIdx); this.setState('intro');
  }
  _lock() { const p = this.cv.requestPointerLock && this.cv.requestPointerLock(); if (p && p.catch) p.catch(() => {}); }

  // ── input ────────────────────────────────────────────────────────────
  _bindInput() {
    document.addEventListener('keydown', e => {
      if (e.code === 'Tab' || e.code === 'Space') e.preventDefault();
      if (this.keys[e.code]) return; this.keys[e.code] = true;
      if (this.state !== 'play') return;
      if (e.code === 'Tab') this.showMap = !this.showMap;
      if (e.code === 'KeyM') this.msg(AudioSys.toggle() ? 'Geluid UIT' : 'Geluid AAN');
      if (e.code === 'KeyF') document.body.classList.toggle('nocrt');
      if (e.code === 'Digit1') this.switchWeapon(0);
      if (e.code === 'Digit2') this.switchWeapon(1);
      if (e.code === 'Digit3') this.switchWeapon(2);
      if (e.code === 'Digit4') this.switchWeapon(3);
      if (e.code === 'KeyE' || e.code === 'Space') this.use();
      if (e.code === 'ControlLeft' || e.code === 'ControlRight') this.press(true);
    });
    document.addEventListener('keyup', e => {
      this.keys[e.code] = false;
      if (e.code === 'ControlLeft' || e.code === 'ControlRight') this.press(false);
    });
    document.addEventListener('mousemove', e => {
      if (this.state === 'play' && document.pointerLockElement === this.cv)
        this.ang += e.movementX * 0.0026;
    });
    this.cv.addEventListener('mousedown', e => {
      if (this.state !== 'play' || e.button !== 0) return;
      if (document.pointerLockElement !== this.cv) { this._lock(); return; }
      this.press(true);
    });
    document.addEventListener('mouseup', e => { if (e.button === 0) this.press(false); });
    document.addEventListener('pointerlockchange', () => {
      if (!document.pointerLockElement && this.state === 'play') this.pause();
    });
  }
  press(down) {
    if (this.state !== 'play') { this.firing = false; return; }
    this.firing = down;
    if (down) { const w = WEAPONS[this.inv.weapon]; if (!w.auto) this.tryFire(); }
  }
  switchWeapon(i) {
    if (!this.inv.owned[i] || i === this.inv.weapon) return;
    this.inv.weapon = i; AudioSys.play('swap'); this.msg(WEAPONS[i].name);
  }
  msg(t) { this.message = t; this.msgT = 2.2; }

  // ── wereld ───────────────────────────────────────────────────────────
  cell(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return '#';
    return this.grid[y][x];
  }
  passable(x, y) {
    const ch = this.cell(x | 0, y | 0);
    if (DOORCH[ch]) { const d = this.doors[(x | 0) + ',' + (y | 0)]; return d && d.open > 0.6; }
    return WALLCH[ch] === undefined && ch !== 'E' && ch !== '@';
  }
  canMove(x, y, r) {
    return this.passable(x - r, y - r) && this.passable(x + r, y - r) &&
           this.passable(x - r, y + r) && this.passable(x + r, y + r);
  }
  castDist(ox, oy, rdx, rdy) {
    let mx = ox | 0, my = oy | 0;
    const ddx = rdx === 0 ? 1e30 : Math.abs(1 / rdx), ddy = rdy === 0 ? 1e30 : Math.abs(1 / rdy);
    let stepX, stepY, sdx, sdy, side = 0;
    if (rdx < 0) { stepX = -1; sdx = (ox - mx) * ddx; } else { stepX = 1; sdx = (mx + 1 - ox) * ddx; }
    if (rdy < 0) { stepY = -1; sdy = (oy - my) * ddy; } else { stepY = 1; sdy = (my + 1 - oy) * ddy; }
    for (let i = 0; i < 96; i++) {
      if (sdx < sdy) { sdx += ddx; mx += stepX; side = 0; } else { sdy += ddy; my += stepY; side = 1; }
      const dist = side === 0 ? sdx - ddx : sdy - ddy;
      const ch = this.cell(mx, my);
      if (DOORCH[ch]) { const d = this.doors[mx + ',' + my]; if (d && d.open >= 0.98) continue; return { dist, ch, mx, my }; }
      if (WALLCH[ch] !== undefined || ch === 'E') return { dist, ch, mx, my };
    }
    return { dist: 90, ch: null, mx, my };
  }
  los(x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0, dist = Math.hypot(dx, dy);
    const steps = Math.ceil(dist / 0.18);
    for (let i = 1; i < steps; i++) {
      const t = i / steps, cx = x0 + dx * t, cy = y0 + dy * t;
      const ch = this.cell(cx | 0, cy | 0);
      if (DOORCH[ch]) { const d = this.doors[(cx | 0) + ',' + (cy | 0)]; if (!d || d.open < 0.5) return false; }
      else if (WALLCH[ch] !== undefined || ch === 'E') return false;
    }
    return true;
  }

  use() {
    for (const d of [0.75, 1.25]) {
      const tx = (this.px + Math.cos(this.ang) * d) | 0, ty = (this.py + Math.sin(this.ang) * d) | 0;
      const ch = this.cell(tx, ty);
      if (ch === 'E') { this.levelClear(); return; }
      if (DOORCH[ch]) {
        const door = this.doors[tx + ',' + ty]; if (!door || door.on) continue;
        if (door.locked === 'g' && !this.inv.keys.g) { AudioSys.play('locked'); this.msg('Je hebt een GOUDEN sleutel nodig!'); return; }
        if (door.locked === 's' && !this.inv.keys.s) { AudioSys.play('locked'); this.msg('Je hebt een ZILVEREN sleutel nodig!'); return; }
        if (door.locked) { this.msg(door.locked === 'g' ? 'Gouden sleutels passen overal!' : 'Klik! De zilveren deur zwaait open.'); this.inv.keys[door.locked] = false; }
        door.on = true; AudioSys.play('door');
        if (door.push) { this.secretsFound++; AudioSys.play('secret'); this.msg('EEN GEHEIM!'); }
        return;
      }
    }
  }

  // ── gevecht ──────────────────────────────────────────────────────────
  tryFire() {
    const w = WEAPONS[this.inv.weapon];
    if (this.fireCd > 0) return;
    if (w.use > 0 && this.inv.ammo < w.use) { AudioSys.play('dry'); this.msg('GEEN MUNITIE!'); this.fireCd = 0.4; return; }
    this.fireCd = w.rate; this.flashT = 0.07; this.fireAnim = 1;
    this.inv.ammo -= w.use; AudioSys.play(w.snd);
    const mult = this.rushT > 0 ? 2 : 1;
    const pellets = w.pellets || 1;
    for (let p = 0; p < pellets; p++) {
      const a = this.ang + (pellets > 1 ? (Math.random() - 0.5) * w.spread : 0);
      const wall = this.castDist(this.px, this.py, Math.cos(a), Math.sin(a));
      let best = null, bestD = Math.min(wall.dist, w.range);
      for (const e of this.enemies) {
        if (e.state === 'dead' || e.state === 'dying') continue;
        const dx = e.x - this.px, dy = e.y - this.py, dist = Math.hypot(dx, dy);
        if (dist > bestD) continue;
        if (Math.abs(angDiff(Math.atan2(dy, dx), a)) < Math.atan(0.42 / Math.max(dist, 0.4))) { best = e; bestD = dist; }
      }
      if (best) this.hitEnemy(best, w.dmg * mult * (this.rushT > 0 && w.key === 'knife' ? 6 : 1));
    }
  }
  hitEnemy(e, dmg) {
    e.hp -= dmg; e.painT = 0.18;
    if (e.hp <= 0) {
      e.state = 'dying'; e.dieT = 0; this.kills++; this.score += e.score;
      AudioSys.play('edie');
    } else AudioSys.play('ehit');
  }
  hurtPlayer(dmg) {
    if (this.invulnT > 0 || this.state !== 'play') return;
    this.health -= dmg; this.dmgFlash = 0.4; AudioSys.play('phit');
    if (this.health <= 0) {
      this.health = 0; AudioSys.play('death'); this.lives--;
      this.setState(this.lives <= 0 ? 'gameover' : 'dead');
    }
  }
  levelClear() {
    AudioSys.play('clear');
    const bonus = 500 + this.secretsFound * 250 + Math.max(0, 2000 - Math.floor(this.levelTime) * 10);
    this.score += bonus; this.clearBonus = bonus;
    this.setState(this.levelIdx >= LEVELS.length - 1 ? 'win' : 'clear');
  }

  // ── update ───────────────────────────────────────────────────────────
  update(dt) {
    if (this.state !== 'play') return;
    this.time += dt; this.levelTime += dt;
    for (const k in this.doors) { const d = this.doors[k]; if (d.on && d.open < 1) d.open = Math.min(1, d.open + dt * 1.6); }
    if (this.fireCd > 0) this.fireCd -= dt;
    if (this.flashT > 0) this.flashT -= dt;
    if (this.fireAnim > 0) this.fireAnim -= dt * 6;
    if (this.dmgFlash > 0) this.dmgFlash -= dt;
    if (this.msgT > 0) this.msgT -= dt;
    if (this.rushT > 0) this.rushT -= dt;
    if (this.invulnT > 0) this.invulnT -= dt;

    // bewegen
    const run = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
    const sp = (run ? 4.4 : 3.0) * dt;
    let mx = 0, my = 0;
    const ca = Math.cos(this.ang), sa = Math.sin(this.ang);
    if (this.keys['KeyW'] || this.keys['ArrowUp']) { mx += ca; my += sa; }
    if (this.keys['KeyS'] || this.keys['ArrowDown']) { mx -= ca; my -= sa; }
    if (this.keys['KeyA']) { mx += sa; my -= ca; }
    if (this.keys['KeyD']) { mx -= sa; my += ca; }
    if (this.keys['ArrowLeft']) this.ang -= 2.4 * dt;
    if (this.keys['ArrowRight']) this.ang += 2.4 * dt;
    const len = Math.hypot(mx, my);
    this.moveAmt = len > 0 ? Math.min(1, this.moveAmt + dt * 6) : Math.max(0, this.moveAmt - dt * 6);
    if (len > 0) {
      mx = mx / len * sp; my = my / len * sp; this.bob += dt * (run ? 13 : 9);
      if (this.canMove(this.px + mx, this.py, 0.28)) this.px += mx;
      if (this.canMove(this.px, this.py + my, 0.28)) this.py += my;
      this.autoDoors();
    }
    if (this.firing && WEAPONS[this.inv.weapon].auto) this.tryFire();

    // items
    for (const it of this.items) {
      if (it.taken) continue;
      if (Math.hypot(it.x - this.px, it.y - this.py) > 0.55) continue;
      it.taken = true; this.pickup(it.type);
    }
    // vijanden
    for (const e of this.enemies) this.updateEnemy(e, dt);
  }
  autoDoors() {
    const fx = (this.px + Math.cos(this.ang) * 0.7) | 0, fy = (this.py + Math.sin(this.ang) * 0.7) | 0;
    const ch = this.cell(fx, fy);
    if (DOORCH[ch]) { const d = this.doors[fx + ',' + fy]; if (d && !d.on && !d.locked) { d.on = true; AudioSys.play('door'); } }
  }
  updateEnemy(e, dt) {
    if (e.state === 'dead') return;
    if (e.state === 'dying') { e.dieT += dt; if (e.dieT > 0.55) e.state = 'dead'; return; }
    if (e.painT > 0) e.painT -= dt;
    if (e.fireT > 0) e.fireT -= dt;
    if (e.cd > 0) e.cd -= dt;
    const dx = this.px - e.x, dy = this.py - e.y, dist = Math.hypot(dx, dy);
    const sees = dist < 13 && this.los(e.x, e.y, this.px, this.py);
    if (sees && !e.alert) { e.alert = true; AudioSys.play('alert'); this.msg(e.kind === 'o' ? 'ACHTUNG!' : 'ALARM!'); }
    if (!e.alert) return;
    e.face = Math.atan2(dy, dx);
    if (e.melee) {
      if (dist < 1.15 && e.cd <= 0) { e.cd = e.cdMax || 0.9; e.fireT = 0.15; this.hurtPlayer(e.dmg); }
    } else if (sees && dist < 10 && e.cd <= 0) {
      e.cd = e.cdMax; e.fireT = 0.16; AudioSys.play('eshoot');
      const chance = Math.max(0.18, 0.85 - dist * 0.06);
      if (Math.random() < chance) this.hurtPlayer(e.dmg);
    }
    if (dist > (e.melee ? 0.9 : 2.2)) {
      const sp = e.speed * dt, nx = dx / dist * sp, ny = dy / dist * sp;
      let moved = false;
      if (this.canMove(e.x + nx, e.y, 0.3)) { e.x += nx; moved = true; }
      if (this.canMove(e.x, e.y + ny, 0.3)) { e.y += ny; moved = true; }
      if (!moved) { // deur in de weg: openen / omkijken
        const tx = (e.x + nx * 3) | 0, ty = (e.y + ny * 3) | 0, ch = this.cell(tx, ty);
        if (DOORCH[ch]) { const d = this.doors[tx + ',' + ty]; if (d && !d.on && !d.locked) { d.on = true; AudioSys.play('door'); } }
        const side = e.face + Math.PI / 2 * (Math.sin(this.time * 2 + e.x) > 0 ? 1 : -1);
        if (this.canMove(e.x + Math.cos(side) * sp, e.y + Math.sin(side) * sp, 0.3)) {
          e.x += Math.cos(side) * sp; e.y += Math.sin(side) * sp;
        }
      }
    }
  }
  pickup(type) {
    switch (type) {
      case 'health': if (this.health >= 100) { this.score += 50; break; } this.health = Math.min(100, this.health + 10); AudioSys.play('pickup'); this.msg('+10 gezondheid'); break;
      case 'medkit': this.health = Math.min(100, this.health + 30); AudioSys.play('pickup'); this.msg('MEDKIT +30'); break;
      case 'ammo': this.inv.ammo += 12; AudioSys.play('pickup'); this.msg('+12 munitie'); break;
      case 'ammoBox': this.inv.ammo += 40; AudioSys.play('pickup'); this.msg('+40 munitie'); break;
      case 'knife': this.inv.owned[0] = true; this.switchWeapon(0); AudioSys.play('pickup'); this.msg('MES'); break;
      case 'pistol': this.inv.owned[1] = true; this.inv.weapon = 1; AudioSys.play('pickup'); this.msg('PISTOOL'); break;
      case 'shotgun': this.inv.owned[2] = true; this.inv.weapon = 2; AudioSys.play('pickup'); this.msg('SHOTGUN — pijnlijk mooi'); break;
      case 'chaingun': this.inv.owned[3] = true; this.inv.weapon = 3; AudioSys.play('pickup'); this.msg('MACHINEGUN — Feuer!'); break;
      case 'treasure': this.score += 250; AudioSys.play('treasure'); this.msg('+250 schat'); break;
      case 'treasureBig': this.score += 500; AudioSys.play('treasure'); this.msg('+500 GROTE SCHAT'); break;
      case 'life': this.lives = Math.min(5, this.lives + 1); AudioSys.play('life'); this.msg('EXTRA LEVEN!'); break;
      case 'keyGold': this.inv.keys.g = true; AudioSys.play('pickup'); this.msg('GOUDEN SLEUTEL'); break;
      case 'keySilver': this.inv.keys.s = true; AudioSys.play('pickup'); this.msg('ZILVEREN SLEUTEL'); break;
      case 'rush': this.rushT = 20; AudioSys.play('rush'); this.msg('RUSH!! Dubbele schade, 20 seconden!'); break;
    }
  }

  // ── render ───────────────────────────────────────────────────────────
  render() {
    const g = this.ctx;
    if (this.state === 'menu') { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); return; }
    // lucht/plafond + vloer (met zachte diepte-gradiënt)
    let grd = g.createLinearGradient(0, 0, 0, VH / 2);
    grd.addColorStop(0, '#101216'); grd.addColorStop(1, '#2d3038');
    g.fillStyle = grd; g.fillRect(0, 0, W, VH / 2);
    grd = g.createLinearGradient(0, VH / 2, 0, VH);
    grd.addColorStop(0, '#4a3826'); grd.addColorStop(1, '#241a10');
    g.fillStyle = grd; g.fillRect(0, VH / 2, W, VH / 2);
    // muren
    const dirX = Math.cos(this.ang), dirY = Math.sin(this.ang);
    const plX = -dirY * 0.66, plY = dirX * 0.66;
    for (let x = 0; x < W; x++) {
      const cam = 2 * x / W - 1;
      const rdx = dirX + plX * cam, rdy = dirY + plY * cam;
      const hit = this.castRayCam(rdx, rdy, x);
      if (!hit) { this.zbuf[x] = 90; continue; }
      const { dist, side, ch, wallX } = hit;
      this.zbuf[x] = dist;
      const lineH = VH / dist;
      const drawStart = VH / 2 - lineH / 2;
      let tex = ASSETS.tex[WALLCH[ch] || 'brick'];
      if (DOORCH[ch]) tex = ASSETS.tex[DOORCH[ch]];
      let texX = (wallX * 64) | 0;
      if ((side === 0 && rdx > 0) || (side === 1 && rdy < 0)) texX = 63 - texX;
      if (DOORCH[ch]) {
        const d = this.doors[hit.mx + ',' + hit.my];
        const open = d ? d.open : 0;
        const vh = lineH * (1 - open);
        if (vh > 0.5) g.drawImage(tex, texX, 0, 1, 64, x, drawStart + (lineH - vh), 1, vh);
      } else {
        g.drawImage(tex, texX, 0, 1, 64, x, drawStart, 1, lineH);
      }
      let shade = Math.min(0.78, dist * 0.085) + (side === 1 ? 0.16 : 0);
      if (shade > 0.02) { g.fillStyle = 'rgba(0,0,0,' + shade.toFixed(2) + ')'; g.fillRect(x, drawStart, 1, lineH); }
    }
    // sprites
    const list = [];
    for (const it of this.items) if (!it.taken) list.push({ x: it.x, y: it.y, spr: ASSETS.items[ITEMSPR[it.type]], scale: 0.42, dog: false });
    for (const e of this.enemies) {
      let spr;
      if (e.state === 'dead') spr = ASSETS.spr[e.spr + 'Corpse'];
      else if (e.state === 'dying') spr = ASSETS.spr[e.spr + 'Die'];
      else if (e.fireT > 0) spr = ASSETS.spr[e.spr + 'Fire'];
      else spr = ASSETS.spr[e.spr];
      list.push({ x: e.x, y: e.y, spr, scale: e.scale, dist: (e.x - this.px) ** 2 + (e.y - this.py) ** 2 });
    }
    for (const s of list) if (s.dist === undefined) s.dist = (s.x - this.px) ** 2 + (s.y - this.py) ** 2;
    list.sort((a, b) => b.dist - a.dist);
    const invDet = 1 / (plX * dirY - dirX * plY);
    for (const s of list) {
      const sx = s.x - this.px, sy = s.y - this.py;
      const tx = invDet * (dirY * sx - dirX * sy);
      const ty = invDet * (-plY * sx + plX * sy);
      if (ty <= 0.15) continue;
      const scrX = (W / 2) * (1 + tx / ty);
      const hgt = s.scale * VH / ty;
      const wid = hgt * (s.spr.width / s.spr.height);
      const top = VH / 2 + VH / (2 * ty) - hgt;
      const x0 = Math.max(0, Math.floor(scrX - wid / 2)), x1 = Math.min(W - 1, Math.ceil(scrX + wid / 2));
      let run = -1;
      for (let x = x0; x <= x1 + 1; x++) {
        const vis = x <= x1 && ty < this.zbuf[x];
        if (vis && run < 0) run = x;
        if (!vis && run >= 0) {
          const u0 = ((run - (scrX - wid / 2)) / wid) * s.spr.width;
          const u1 = ((x - (scrX - wid / 2)) / wid) * s.spr.width;
          if (u1 > u0) g.drawImage(s.spr, u0, 0, Math.max(1, u1 - u0), s.spr.height, run, top, x - run, hgt);
          run = -1;
        }
      }
    }
    // wapen-model
    const w = WEAPONS[this.inv.weapon];
    const bobY = Math.sin(this.bob) * 5 * this.moveAmt, bobX = Math.cos(this.bob * 0.5) * 4 * this.moveAmt;
    const recoil = this.fireAnim > 0 ? this.fireAnim * 14 : 0;
    g.drawImage(ASSETS.wp[w.key], W / 2 - 80 + bobX, VH - 112 + bobY + recoil);
    if (this.flashT > 0) g.drawImage(ASSETS.wp.flash, W / 2 - 45 + bobX, VH - 175 + bobY + recoil);
    // overlays
    if (this.rushT > 0) { g.fillStyle = 'rgba(255,170,0,' + (0.07 + 0.04 * Math.sin(this.time * 12)) + ')'; g.fillRect(0, 0, W, VH); }
    if (this.dmgFlash > 0) { g.fillStyle = 'rgba(255,0,0,' + (this.dmgFlash * 0.7).toFixed(2) + ')'; g.fillRect(0, 0, W, VH); }
    // vizier
    g.fillStyle = '#0f0'; g.fillRect(W / 2 - 5, VH / 2, 4, 1); g.fillRect(W / 2 + 2, VH / 2, 4, 1);
    g.fillRect(W / 2 - 1, VH / 2 - 4, 1, 3); g.fillRect(W / 2, VH / 2 + 2, 1, 3);
    // bericht
    if (this.msgT > 0) {
      g.font = 'bold 15px monospace'; g.textAlign = 'center';
      g.fillStyle = '#000'; g.fillText(this.message, W / 2 + 1, 26);
      g.fillStyle = '#ffe060'; g.fillText(this.message, W / 2, 25);
    }
    if (this.showMap) this.renderMinimap(g);
    this.renderHUD(g);
  }
  castRayCam(rdx, rdy, x) {
    let mx = this.px | 0, my = this.py | 0;
    const ddx = rdx === 0 ? 1e30 : Math.abs(1 / rdx), ddy = rdy === 0 ? 1e30 : Math.abs(1 / rdy);
    let stepX, stepY, sdx, sdy;
    if (rdx < 0) { stepX = -1; sdx = (this.px - mx) * ddx; } else { stepX = 1; sdx = (mx + 1 - this.px) * ddx; }
    if (rdy < 0) { stepY = -1; sdy = (this.py - my) * ddy; } else { stepY = 1; sdy = (my + 1 - this.py) * ddy; }
    let side = 0;
    for (let i = 0; i < 96; i++) {
      if (sdx < sdy) { sdx += ddx; mx += stepX; side = 0; } else { sdy += ddy; my += stepY; side = 1; }
      const ch = this.cell(mx, my);
      if (DOORCH[ch]) {
        const d = this.doors[mx + ',' + my];
        if (d && d.open >= 0.98) continue;
        const dist = side === 0 ? sdx - ddx : sdy - ddy;
        let wallX = side === 0 ? this.py + dist * rdy : this.px + dist * rdx;
        return { dist, side, ch, mx, my, wallX: wallX - Math.floor(wallX) };
      }
      if (WALLCH[ch] !== undefined || ch === 'E') {
        const dist = side === 0 ? sdx - ddx : sdy - ddy;
        let wallX = side === 0 ? this.py + dist * rdy : this.px + dist * rdx;
        return { dist, side, ch, mx, my, wallX: wallX - Math.floor(wallX) };
      }
    }
    return null;
  }
  renderMinimap(g) {
    const S = 5, MW = 100, MH = 100, ox = 6, oy = 6;
    g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(ox, oy, MW, MH);
    g.save(); g.beginPath(); g.rect(ox, oy, MW, MH); g.clip();
    const cx = ox + MW / 2 - this.px * S, cy = oy + MH / 2 - this.py * S;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const ch = this.grid[y][x];
      let col = null;
      if (WALLCH[ch]) col = '#666';
      else if (ch === 'E') col = '#0c0';
      else if (ch === 'D') col = '#aa0';
      else if (ch === 'G') col = '#fc3';
      else if (ch === 'V') col = '#ccd';
      else if (ch === 'P') col = '#886';
      if (col) g.fillRect(cx + x * S, cy + y * S, S, S);
    }
    for (const e of this.enemies) if (e.state !== 'dead') { g.fillStyle = '#f33'; g.fillRect(cx + e.x * S - 1, cy + e.y * S - 1, 3, 3); }
    for (const it of this.items) if (!it.taken) { g.fillStyle = '#3f3'; g.fillRect(cx + it.x * S - 1, cy + it.y * S - 1, 2, 2); }
    g.fillStyle = '#fff';
    g.beginPath();
    g.moveTo(ox + MW / 2 + Math.cos(this.ang) * 4, oy + MH / 2 + Math.sin(this.ang) * 4);
    g.lineTo(ox + MW / 2 + Math.cos(this.ang + 2.5) * 3, oy + MH / 2 + Math.sin(this.ang + 2.5) * 3);
    g.lineTo(ox + MW / 2 + Math.cos(this.ang - 2.5) * 3, oy + MH / 2 + Math.sin(this.ang - 2.5) * 3);
    g.fill(); g.restore();
  }
  renderHUD(g) {
    const y0 = VH;
    g.fillStyle = '#151515'; g.fillRect(0, y0, W, HUD_H);
    g.fillStyle = '#4a4a4a'; g.fillRect(0, y0, W, 2);
    g.font = 'bold 15px monospace'; g.textAlign = 'left';
    // munitie
    g.drawImage(ASSETS.icon.ammo, 8, y0 + 6);
    g.fillStyle = this.inv.ammo > 10 ? '#fc3' : '#f44';
    g.fillText(String(this.inv.ammo).padStart(3, ' '), 26, y0 + 20);
    // gezondheid
    g.drawImage(ASSETS.icon.health, 8, y0 + 24);
    g.fillStyle = this.health > 60 ? '#5f5' : this.health > 30 ? '#fc3' : '#f44';
    g.fillText(String(this.health).padStart(3, ' ') + '%', 26, y0 + 38);
    // wapen
    g.fillStyle = '#aaa'; g.font = 'bold 10px monospace';
    g.fillText('WAPE', 78, y0 + 12);
    g.font = 'bold 15px monospace'; g.fillStyle = '#fff';
    g.fillText((this.inv.weapon + 1) + ' ' + WEAPONS[this.inv.weapon].short, 78, y0 + 28);
    if (this.rushT > 0) { g.fillStyle = '#fa0'; g.fillText('RUSH ' + Math.ceil(this.rushT), 78, y0 + 40); }
    // gezicht
    const fv = this.health > 66 ? 'ok' : this.health > 33 ? 'hurt' : 'hurt';
    g.drawImage(ASSETS.face[fv], 168, y0 + 6, 32, 32);
    // sleutels
    if (this.inv.keys.g) g.drawImage(ASSETS.icon.keyGold, 208, y0 + 6);
    if (this.inv.keys.s) g.drawImage(ASSETS.icon.keySilver, 208, y0 + 24);
    // leven
    g.drawImage(ASSETS.icon.life, 232, y0 + 6);
    g.fillStyle = '#fff'; g.fillText('x' + this.lives, 250, y0 + 20);
    // score
    g.fillStyle = '#aaa'; g.font = 'bold 10px monospace'; g.fillText('SCORE', 232, y0 + 38);
    g.fillStyle = '#fc3'; g.font = 'bold 14px monospace'; g.fillText(String(this.score), 272, y0 + 38);
    // level + tijd + kills
    g.fillStyle = '#aaa'; g.font = 'bold 10px monospace'; g.fillText('LEVEL', 340, y0 + 12);
    g.fillStyle = '#fff'; g.font = 'bold 15px monospace'; g.fillText(String(this.levelIdx + 1) + '/' + LEVELS.length, 340, y0 + 28);
    const t = Math.floor(this.levelTime), mm = String(t / 60 | 0).padStart(2, '0'), ss = String(t % 60).padStart(2, '0');
    g.fillStyle = '#aaa'; g.font = 'bold 10px monospace'; g.fillText('TIJD', 400, y0 + 12);
    g.fillStyle = '#fff'; g.font = 'bold 13px monospace'; g.fillText(mm + ':' + ss, 400, y0 + 26);
    g.fillText(this.kills + '/' + this.enemiesTotal, 400, y0 + 40);
    g.drawImage(AudioSys.muted ? ASSETS.icon.mute : ASSETS.icon.sound, 456, y0 + 6);
  }
}
function sideDist(sdx, sdy, ddx, ddy) { return sdx < sdy ? sdx - ddx : sdy - ddy; }
