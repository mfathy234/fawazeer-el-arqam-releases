/* Audio: cafe music loops, stingers and SFX from game/audio/ (made by tools/audio), played with WebAudio.
   Nothing starts before the first tap or key (browser rule); Sound.arm() listens for it. Files not loaded yet fall back to tiny synth blips.
   API: Sound.play(name)  sfx / stinger by short name (click pick drop ok bad hint coin buy undo shuffle tea | win stars unlock)
        Sound.music(name) 'menu' | 'play' | 'daily' | null, crossfades; Sound.sync(UI) picks it from the game state
        Sound.setMuted(m), Sound.setPrefs(save.prefs) (music / sfx volume 0-100), Sound.status()
   Everything goes through a limiter. Safari gets mp3; any ogg that fails to decode falls back to mp3. */

const Sound = {
  ctx: null, muted: false, ready: false, want: null, cur: null, bufs: {}, failed: [], ext: null, started: false, stingerSrc: null, loading: {}, armed: false, silent: null,
  vol: { music: 0.8, sfx: 1 },
  DIR: 'audio/', LOOP_SEC: AUDIO.loopSec, FADE: 1.2, MP3_DELAY: AUDIO.mp3Delay,
  TRACKS: { menu: 'music_menu', play: 'music_play', daily: 'music_daily' },
  SFX: { click: 'sfx_click', pick: 'sfx_pick', drop: 'sfx_drop', ok: 'sfx_ok', bad: 'sfx_bad', hint: 'sfx_hint', coin: 'sfx_coin', buy: 'sfx_buy', undo: 'sfx_undo', shuffle: 'sfx_shuffle', tea: 'sfx_tea' },
  STINGERS: { win: 'stinger_win', stars: 'stinger_stars', unlock: 'stinger_unlock' },
  GAIN: { music: 0.8, sfx: 0.9, duck: 0.35 },

  isIos() { const ua = navigator.userAgent || ''; return /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1); },
  isSafari() { const ua = navigator.userAgent || ''; return this.isIos() || (/Safari/.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|Android|Edg/.test(ua)); },
  pickExt() {
    if (this.isSafari()) return 'mp3';
    const probe = document.createElement('audio');
    return probe.canPlayType && probe.canPlayType('audio/ogg; codecs="vorbis"') ? 'ogg' : 'mp3';
  },
  musicGain() { return this.GAIN.music * this.vol.music; },
  sfxGain() { return this.GAIN.sfx * this.vol.sfx; },

  build(c) {
    this.master = c.createGain(); this.master.gain.value = this.muted ? 0 : 1;
    const l = this.limiter = c.createDynamicsCompressor();
    l.threshold.value = -6; l.knee.value = 3; l.ratio.value = 20; l.attack.value = 0.002; l.release.value = 0.12;
    this.trim = c.createGain(); this.trim.gain.value = 0.94;
    this.master.connect(l); l.connect(this.trim); this.trim.connect(c.destination);
    this.musicBus = c.createGain(); this.musicBus.gain.value = this.musicGain(); this.musicBus.connect(this.master);
    this.sfxBus = c.createGain(); this.sfxBus.gain.value = this.sfxGain(); this.sfxBus.connect(this.master);
  },
  arm() {
    if (this.armed || typeof document === 'undefined') return;
    this.armed = true;
    const go = () => { if (!this.ctx) this.start(); else if (this.ctx.state !== 'running') this.apply(); this.keepAwake(); };
    ['pointerup', 'touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, go, true));
    document.addEventListener('visibilitychange', () => this.apply());
    addEventListener('pageshow', () => this.apply());
  },
  start() {
    if (this.ctx) { this.apply(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { this.ctx = new AC(); } catch (e) { this.ctx = null; return; }
    this.build(this.ctx);
    this.ext = this.pickExt();
    this.started = true;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* not supported */ }
    this.keepAwake();
    this.apply();
    this.preload();
    if (this.want) this.music(this.want);
  },
  /* iOS before 17: a silent looping <audio> moves WebAudio to the media channel, which the silent switch does not mute. */
  keepAwake() {
    if (!this.isIos() || navigator.audioSession) return;
    if (!this.silent) {
      const n = 4000, b = new Uint8Array(44 + n), v = new DataView(b.buffer), w = (o, str) => { for (let i = 0; i < str.length; i++) b[o + i] = str.charCodeAt(i); };
      w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
      v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true);
      b.fill(128, 44);
      const a = document.createElement('audio');
      a.src = URL.createObjectURL(new Blob([b], { type: 'audio/wav' }));
      a.loop = true; a.setAttribute('playsinline', ''); a.volume = 0.01;
      this.silent = a;
    }
    if (this.silent.paused && !document.hidden) { const p = this.silent.play(); if (p && p.catch) p.catch(() => null); }
  },
  apply() {
    const c = this.ctx;
    if (!c) return;
    if (document.hidden) { if (c.state === 'running') c.suspend().catch(() => null); if (this.silent) this.silent.pause(); }
    else { if (c.state !== 'running') c.resume().catch(() => null); this.keepAwake(); }
  },
  setPrefs(p) {
    const q = p || {};
    this.vol = { music: (q.music == null ? 80 : q.music) / 100, sfx: (q.sfx == null ? 100 : q.sfx) / 100 };
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.musicBus.gain.cancelScheduledValues(t);
    this.musicBus.gain.setTargetAtTime(this.musicGain(), t, 0.03);
    this.sfxBus.gain.setTargetAtTime(this.sfxGain(), t, 0.03);
  },
  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.03);
    if (m && this.stingerSrc) { try { this.stingerSrc.stop(); } catch (e) { /* already ended */ } }
  },

  fetchDecode(file, ext) {
    const c = this.ctx;
    return fetch(this.DIR + file + '.' + ext + (typeof FAWAZEER_BUILD === 'string' ? '?v=' + FAWAZEER_BUILD : '')).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(ab => new Promise((ok, no) => { const p = c.decodeAudioData(ab, ok, no); if (p && p.catch) p.catch(no); }));
  },
  load(file) {
    if (this.bufs[file]) return Promise.resolve(this.bufs[file]);
    if (this.loading[file]) return this.loading[file];
    this.loading[file] = this.fetchDecode(file, this.ext)
      .catch(err => { if (this.ext !== 'ogg') throw err; this.ext = 'mp3'; return this.fetchDecode(file, 'mp3'); })
      .then(b => { this.bufs[file] = b; return b; })
      .catch(() => { delete this.loading[file]; if (!this.failed.includes(file)) this.failed.push(file); return null; });
    return this.loading[file];
  },
  preload() {
    const small = [...Object.values(this.SFX), ...Object.values(this.STINGERS)];
    this.load(this.TRACKS[this.want] || this.TRACKS.menu)
      .then(() => Promise.all(small.map(f => this.load(f))))
      .then(() => Promise.all(Object.values(this.TRACKS).map(f => this.load(f))))
      .then(() => { this.ready = true; });
  },

  music(name) {
    this.want = name || null;
    if (!this.ctx) return;
    if (!name) { this.fadeOut(); return; }
    if (this.cur && this.cur.name === name) return;
    this.load(this.TRACKS[name]).then(buf => {
      if (!buf || this.want !== name || (this.cur && this.cur.name === name)) return;
      this.crossTo(name, buf);
    });
  },
  /* An mp3 that kept its encoder delay is longer than the loop, so the loop starts after the delay; a trimmed one (Safari) starts at 0. */
  crossTo(name, buf) {
    const c = this.ctx, t = c.currentTime, off = buf.duration > this.LOOP_SEC + 0.03 ? this.MP3_DELAY : 0;
    this.fadeOut();
    const src = c.createBufferSource(), g = c.createGain();
    src.buffer = buf; src.loop = true; src.loopStart = off; src.loopEnd = Math.min(off + this.LOOP_SEC, buf.duration);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(1, t + this.FADE);
    src.connect(g).connect(this.musicBus);
    src.start(0, off);
    this.cur = { name, src, g };
  },
  fadeOut() {
    const old = this.cur, c = this.ctx;
    if (!old) return;
    this.cur = null;
    const t = c.currentTime;
    old.g.gain.cancelScheduledValues(t);
    old.g.gain.setValueAtTime(old.g.gain.value, t);
    old.g.gain.linearRampToValueAtTime(0.0001, t + this.FADE);
    try { old.src.stop(t + this.FADE + 0.05); } catch (e) { /* already stopped */ }
  },
  duck(sec) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, g = this.musicBus.gain, full = this.musicGain(), low = full * this.GAIN.duck;
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(low, t + 0.1); g.setValueAtTime(low, t + sec); g.linearRampToValueAtTime(full, t + sec + 0.8);
  },
  /** Picks the music from the game state: the daily puzzle has its own loop, other puzzles the thinking loop, everything else the lobby. */
  sync(ui) {
    if (!this.started) return;
    const track = ui.state === 'play' ? (ui.ctx && ui.ctx.kind === 'daily' ? 'daily' : 'play') : 'menu';
    if (track !== this.want) this.music(track);
  },

  buffer(file, bus, vol = 1, rate = 1) {
    const b = this.bufs[file];
    if (!b || !this.ctx) return null;
    const src = this.ctx.createBufferSource(), g = this.ctx.createGain();
    src.buffer = b; src.playbackRate.value = rate; g.gain.value = vol;
    src.connect(g).connect(bus);
    try { src.start(); } catch (e) { return null; }
    return src;
  },
  play(name, rate = 1) {
    if (typeof Haptic !== 'undefined') Haptic.sfx(name);
    if (this.muted || !this.ctx) return;
    const st = this.STINGERS[name];
    if (st && this.bufs[st]) {
      if (this.stingerSrc) { try { this.stingerSrc.stop(); } catch (e) { /* already ended */ } }
      this.stingerSrc = this.buffer(st, this.sfxBus, 1);
      this.duck(this.bufs[st].duration);
      return;
    }
    const file = this.SFX[name];
    if (file && this.bufs[file]) { this.buffer(file, this.sfxBus, name === 'click' || name === 'pick' ? 0.8 : 1, rate); return; }
    this.fallback(name);
  },
  status() {
    return { started: this.started, ext: this.ext, ready: this.ready, loaded: Object.keys(this.bufs).length, failed: this.failed.slice(), music: this.cur && this.cur.name, want: this.want, muted: this.muted, state: this.ctx && this.ctx.state, vol: this.vol };
  },

  tone(freq, dur, o = {}) {
    if (this.muted || !this.ctx) return;
    const { type = 'triangle', vol = 0.1, to = freq, delay = 0 } = o;
    const c = this.ctx, t0 = c.currentTime + delay, osc = c.createOscillator(), g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, to), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    osc.connect(g).connect(this.sfxBus);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  },
  fallback(name) {
    switch (name) {
      case 'click': case 'pick': this.tone(700, 0.05, { vol: 0.07 }); break;
      case 'drop': this.tone(300, 0.08, { to: 180, vol: 0.12 }); break;
      case 'ok': this.tone(660, 0.12, { vol: 0.1 }); this.tone(880, 0.2, { vol: 0.1, delay: 0.08 }); break;
      case 'bad': this.tone(180, 0.25, { to: 90, type: 'sawtooth', vol: 0.08 }); break;
      case 'hint': this.tone(1400, 0.06, { vol: 0.08 }); this.tone(1800, 0.08, { vol: 0.08, delay: 0.08 }); break;
      case 'coin': case 'buy': this.tone(988, 0.07, { vol: 0.09 }); this.tone(1318, 0.14, { vol: 0.09, delay: 0.06 }); break;
      case 'win': case 'stars': case 'unlock': [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.16, { vol: 0.1, delay: i * 0.09 })); break;
      default: break;
    }
  }
};

Sound.arm();
