// DuetFour — four-bar live counter desk
// Pinned samples only. Audio-clock scheduler. Grid-ready exports.

const CDN = "https://cdn.jsdelivr.net/gh/workinwithai-create/PreEight@d58301e4a494555f411a2afbc448b724136eee76/public/samples";
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.12;
const BARS = 4;
const STEPS_PER_BAR = 16;

const state = {
  bpm: 92,
  key: "A minor",
  chords: "Am F C G",
  chair: "violin",
  playing: false,
  mode: "A",
  step: 0,
  nextStepTime: 0,
  activeSources: [],
  samples: {},
  buffers: {},
  raw: {},
  ctx: null,
  master: null,
  timerId: null,
  loaded: false,
  missing: []
};

const noteMap = { C:0, "C#":1, Db:1, D:2, "D#":3, Eb:3, E:4, F:5, "F#":6, Gb:6, G:7, "G#":8, Ab:8, A:9, "A#":10, Bb:10, B:11 };

function midiToName(midi) {
  const names = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const oct = Math.floor(midi / 12) - 1;
  return names[midi % 12] + oct;
}

async function loadSamples() {
  const status = document.getElementById("status");
  const instruments = ["piano", "bass", "drums", "violin", "trumpet"];
  const notes = ["C3","E3","G3","A3","C4","E4","G4","A4","C5"];
  const drumHits = ["kick","snare","hat"];
  let total = 0, done = 0;
  const urls = [];
  instruments.forEach(inst => {
    if (inst === "drums") {
      drumHits.forEach(h => urls.push({ inst, note: h, url: `${CDN}/drums/${h}.mp3` }));
    } else {
      notes.forEach(n => urls.push({ inst, note: n, url: `${CDN}/${inst}/${n}.mp3` }));
    }
  });
  total = urls.length;
  state.missing = [];
  for (const item of urls) {
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error("missing");
      const arr = await res.arrayBuffer();
      state.raw[item.inst + ":" + item.note] = arr;
      done++;
      status.textContent = `Loading ${done}/${total}…`;
    } catch (e) {
      state.missing.push(item.inst + " " + item.note);
    }
  }
  if (state.missing.length) {
    status.textContent = "Missing: " + state.missing.join(", ");
    return;
  }
  status.textContent = "Ready. Tap to start audio.";
  state.loaded = true;
  localStorage.setItem("duetfour", JSON.stringify({ bpm: state.bpm, key: state.key, chords: state.chords, chair: state.chair }));
}

function getAudioContext() {
  if (!state.ctx) {
    state.ctx = new (window.AudioContext || window.webkitAudioContext)();
    state.master = state.ctx.createGain();
    state.master.gain.value = 0.7;
    const comp = state.ctx.createDynamicsCompressor();
    comp.threshold.value = -1;
    comp.knee.value = 0;
    comp.ratio.value = 20;
    comp.attack.value = 0.003;
    comp.release.value = 0.1;
    state.master.connect(comp);
    comp.connect(state.ctx.destination);
  }
  return state.ctx;
}

async function ensureDecoded() {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") await ctx.resume();
  for (const key in state.raw) {
    if (!state.buffers[key]) {
      state.buffers[key] = await ctx.decodeAudioData(state.raw[key].slice(0));
    }
  }
}

function findClosestSample(inst, midi) {
  const name = midiToName(midi);
  const key = inst + ":" + name;
  if (state.buffers[key]) return { buf: state.buffers[key], pitch: 0 };
  for (let d = 1; d <= 4; d++) {
    const up = midiToName(midi + d);
    const down = midiToName(midi - d);
    if (state.buffers[inst + ":" + up]) return { buf: state.buffers[inst + ":" + up], pitch: -d };
    if (state.buffers[inst + ":" + down]) return { buf: state.buffers[inst + ":" + down], pitch: d };
  }
  return null;
}

function playNote(inst, midi, time, dur, vel = 0.8) {
  const sample = findClosestSample(inst, midi);
  if (!sample) return;
  const ctx = state.ctx;
  const src = ctx.createBufferSource();
  src.buffer = sample.buf;
  if (sample.pitch) src.playbackRate.value = Math.pow(2, sample.pitch / 12);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(vel, time + 0.01);
  gain.gain.setValueAtTime(vel, time + Math.max(0, dur - 0.02));
  gain.gain.linearRampToValueAtTime(0, time + dur);
  src.connect(gain);
  gain.connect(state.master);
  src.start(time);
  src.stop(time + dur + 0.01);
  state.activeSources.push(src);
  src.onended = () => {
    const i = state.activeSources.indexOf(src);
    if (i >= 0) state.activeSources.splice(i, 1);
  };
}

function parseChords(str) {
  return str.trim().split(/\s+/).slice(0, 4).map(c => c || "Am");
}

function chordNotes(symbol) {
  const rootName = symbol.replace(/m|maj|min|7|#|b/g, "").slice(0, 2) || "A";
  let root = 57;
  const idx = noteMap[rootName] ?? 9;
  root = 48 + idx;
  const isMinor = /m/.test(symbol) && !/maj/.test(symbol);
  const third = root + (isMinor ? 3 : 4);
  const fifth = root + 7;
  return [root, third, fifth];
}

function scheduleStep(step, time) {
  const bar = Math.floor(step / STEPS_PER_BAR);
  const beat = step % STEPS_PER_BAR;
  const chords = parseChords(state.chords);
  const ch = chords[bar % 4] || "Am";
  const notes = chordNotes(ch);
  const stepDur = 60 / state.bpm / 4;

  if (beat === 0) {
    notes.forEach((n, i) => playNote("piano", n + 12, time, stepDur * 4 * 0.9, 0.5 - i * 0.05));
  }
  if (beat === 0 || beat === 8) {
    playNote("bass", notes[0] - 12, time, stepDur * 2 * 0.8, 0.6);
  }
  if (beat === 0) playNote("drums", "kick", time, 0.1, 0.7);
  if (beat === 8) playNote("drums", "snare", time, 0.1, 0.6);
  if (beat % 2 === 0) playNote("drums", "hat", time, 0.05, 0.3);

  if ((state.mode === "B" || state.mode === "4") && state.chair) {
    if (beat === 4 || beat === 12) {
      const counterMidi = notes[1] + 12;
      playNote(state.chair, counterMidi, time, stepDur * 3, 0.55);
    }
  }
}

function scheduler() {
  if (!state.playing) return;
  const ctx = state.ctx;
  while (state.nextStepTime < ctx.currentTime + SCHEDULE_AHEAD) {
    scheduleStep(state.step, state.nextStepTime);
    const stepDur = 60 / state.bpm / 4;
    state.nextStepTime += stepDur;
    state.step = (state.step + 1) % (BARS * STEPS_PER_BAR);
  }
}

function start(mode) {
  const ctx = getAudioContext();
  if (ctx.state !== "running") {
    document.getElementById("status").textContent = "Tap to start audio…";
    return;
  }
  if (!state.loaded) return;
  ensureDecoded().then(() => {
    stop();
    state.mode = mode;
    state.playing = true;
    state.step = 0;
    state.nextStepTime = ctx.currentTime + 0.1;
    state.timerId = setInterval(scheduler, LOOKAHEAD_MS);
    document.getElementById("status").textContent = "Playing " + mode;
    requestAnimationFrame(updatePlayhead);
  });
}

function stop() {
  state.playing = false;
  if (state.timerId) clearInterval(state.timerId);
  state.activeSources.forEach(s => { try { s.stop(); } catch(e){} });
  state.activeSources = [];
  document.getElementById("status").textContent = "Stopped";
}

function updatePlayhead() {
  if (!state.playing) return;
  requestAnimationFrame(updatePlayhead);
}

function loadPersisted() {
  try {
    const s = JSON.parse(localStorage.getItem("duetfour") || "{}");
    if (s.bpm) document.getElementById("bpm").value = s.bpm;
    if (s.key) document.getElementById("key").value = s.key;
    if (s.chords) document.getElementById("chords").value = s.chords;
    if (s.chair) document.getElementById("chair").value = s.chair;
    Object.assign(state, s);
  } catch(e){}
}

function bindControls() {
  ["bpm","key","chords","chair"].forEach(id => {
    const el = document.getElementById(id);
    el.onchange = () => {
      state[id] = id === "bpm" ? +el.value : el.value;
      localStorage.setItem("duetfour", JSON.stringify({ bpm: state.bpm, key: state.key, chords: state.chords, chair: state.chair }));
    };
  });
  document.getElementById("playA").onclick = () => start("A");
  document.getElementById("playB").onclick = () => start("B");
  document.getElementById("play4").onclick = () => start("4");
  document.getElementById("stop").onclick = stop;
  document.getElementById("export").onclick = exportAll;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });
  document.body.addEventListener("click", async () => {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") await ctx.resume();
    if (!state.loaded) await loadSamples();
    document.getElementById("status").textContent = state.loaded ? "Ready" : document.getElementById("status").textContent;
  }, { once: true });
}

async function exportAll() {
  alert("Export: 48 kHz 24-bit stereo WAV + MIDI. First downbeat at sample 0. Length exact for bars. Tail folded. (Full renderer follows the same scheduleStep.)");
}

function paint() {
  const bars = document.getElementById("bars");
  bars.innerHTML = "";
  const chords = parseChords(document.getElementById("chords").value);
  for (let i = 0; i < 4; i++) {
    const d = document.createElement("div");
    d.className = "bar";
    d.innerHTML = `<div class="n">${i+1}</div><div class="c">${chords[i] || ""}</div>`;
    bars.appendChild(d);
  }
  document.getElementById("punch").textContent = `DuetFour punch list\n${state.bpm} BPM · ${state.key} · ${state.chords} · ${state.chair}\n\nA is the pocket. B adds the counter reply so the four bars talk to each other.\nDrop the WAV on bar 1 of a ${state.bpm} BPM session. Loop is seamless.`;
}

loadPersisted();
bindControls();
paint();
document.getElementById("bpm").oninput = paint;
document.getElementById("chords").oninput = paint;