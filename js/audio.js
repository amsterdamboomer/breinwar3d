// BREINWAR 3D — procedureel geluid (WebAudio, geen samples).
'use strict';
const AudioSys = {
  ctx: null, master: null, muted: false, _noiseBuf: null,

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
    const len = this.ctx.sampleRate * 1.2;
    this._noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this._noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  },
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  toggle() { this.muted = !this.muted; if (this.master) this.master.gain.value = this.muted ? 0 : 0.5; return this.muted; },

  _env(node, t0, a, peak, dur) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    node.connect(g); g.connect(this.master);
    return g;
  },
  _noise(t0, dur, peak, freq, q, type) {
    const s = this.ctx.createBufferSource(); s.buffer = this._noiseBuf;
    const f = this.ctx.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.value = freq; f.Q.value = q || 1;
    s.connect(f); this._env(f, t0, 0.005, peak, dur); s.start(t0); s.stop(t0 + dur + 0.05);
  },
  _tone(t0, dur, peak, f0, f1, type) {
    const o = this.ctx.createOscillator(); o.type = type || 'square';
    o.frequency.setValueAtTime(f0, t0);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    this._env(o, t0, 0.008, peak, dur); o.start(t0); o.stop(t0 + dur + 0.05);
  },

  play(name) {
    if (!this.ctx || this.muted) return;
    this.resume();
    const t = this.ctx.currentTime + 0.001;
    switch (name) {
      case 'pistol':   this._noise(t, 0.09, 0.8, 1800, 1); this._tone(t, 0.07, 0.5, 500, 90); break;
      case 'shotgun':  this._noise(t, 0.22, 1.0, 900, 1); this._tone(t, 0.18, 0.7, 220, 50); break;
      case 'mg':       this._noise(t, 0.05, 0.55, 2400, 1); this._tone(t, 0.04, 0.35, 700, 200); break;
      case 'knife':    this._noise(t, 0.12, 0.4, 600, 4, 'bandpass'); break;
      case 'dry':      this._tone(t, 0.05, 0.25, 200, 150, 'triangle'); break;
      case 'swap':     this._tone(t, 0.06, 0.3, 300, 500, 'triangle'); break;
      case 'door':     this._noise(t, 0.6, 0.5, 220, 2); this._tone(t, 0.6, 0.25, 90, 60, 'sawtooth'); break;
      case 'locked':   this._tone(t, 0.18, 0.5, 160, 120, 'square'); this._tone(t + 0.2, 0.18, 0.5, 160, 120, 'square'); break;
      case 'secret':   [523, 659, 784].forEach((f, i) => this._tone(t + i * 0.09, 0.25, 0.35, f, null, 'triangle')); break;
      case 'alert':    this._tone(t, 0.35, 0.4, 880, 440, 'square'); break;
      case 'eshoot':   this._noise(t, 0.08, 0.45, 1500, 1); this._tone(t, 0.06, 0.3, 420, 120); break;
      case 'edie':     this._tone(t, 0.5, 0.5, 300, 60, 'sawtooth'); this._noise(t, 0.3, 0.3, 500, 1); break;
      case 'ehit':     this._noise(t, 0.06, 0.3, 900, 1); break;
      case 'phit':     this._noise(t, 0.15, 0.7, 400, 1); this._tone(t, 0.12, 0.4, 180, 60, 'sawtooth'); break;
      case 'pickup':   this._tone(t, 0.09, 0.4, 440, 880, 'triangle'); break;
      case 'treasure': this._tone(t, 0.08, 0.4, 990, null, 'triangle'); this._tone(t + 0.09, 0.12, 0.4, 1320, null, 'triangle'); break;
      case 'life':     [523, 659, 784, 1046].forEach((f, i) => this._tone(t + i * 0.1, 0.18, 0.4, f, null, 'square')); break;
      case 'rush':     this._tone(t, 0.5, 0.5, 200, 1200, 'sawtooth'); break;
      case 'clear':    [392, 523, 659, 784, 1046].forEach((f, i) => this._tone(t + i * 0.13, 0.3, 0.45, f, null, 'square')); break;
      case 'death':    this._tone(t, 0.9, 0.6, 400, 40, 'sawtooth'); this._noise(t, 0.6, 0.4, 300, 1); break;
      case 'over':     [392, 330, 262, 196].forEach((f, i) => this._tone(t + i * 0.25, 0.4, 0.45, f, null, 'square')); break;
      case 'win':      [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => this._tone(t + i * 0.16, 0.3, 0.45, f, null, 'square')); break;
    }
  }
};
