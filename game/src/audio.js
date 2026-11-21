// audio.js — every sound in Twin Tides is synthesised with WebAudio on the
// spot: a two-note chime for a find, a dull buzz for a miss, a rising arpeggio
// when a scene is cleared. No audio files, nothing to load, and a mute flag
// the engine flips from its sound button.

let context = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function ensureContext() {
  if (muted) return null;
  if (!context) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    context = new AC();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

function tone(freq, start, dur, type, gainPeak) {
  const ac = ensureContext();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const t0 = ac.currentTime + start;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(gainPeak, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function playFind() {
  tone(880, 0, 0.14, 'sine', 0.16);
  tone(1318, 0.07, 0.22, 'sine', 0.16);
}

export function playMiss() {
  tone(150, 0, 0.16, 'sawtooth', 0.07);
  tone(110, 0.02, 0.18, 'sawtooth', 0.05);
}

export function playHint() {
  tone(660, 0, 0.1, 'triangle', 0.1);
  tone(660, 0.14, 0.1, 'triangle', 0.08);
}

export function playClear() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.24, 'sine', 0.13));
}

export function playOver() {
  [392, 330, 262].forEach((f, i) => tone(f, i * 0.13, 0.26, 'triangle', 0.11));
}
