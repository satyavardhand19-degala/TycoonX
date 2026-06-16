let _ctx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.25, delay = 0) {
  try {
    const ac  = ctx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime + delay);
    gain.gain.setValueAtTime(vol, ac.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + dur);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + dur + 0.01);
  } catch {}
}

export function playCoin() {
  tone(900, 0.08, 'sine', 0.18);
  tone(1400, 0.07, 'sine', 0.12, 0.06);
}

export function playBuy() {
  [523, 659, 784].forEach((f, i) => tone(f, 0.13, 'sine', 0.22, i * 0.07));
}

export function playUpgrade() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.11, 'triangle', 0.2, i * 0.06));
}

export function playSell() {
  [659, 494].forEach((f, i) => tone(f, 0.12, 'sine', 0.2, i * 0.08));
}

export function playMerge() {
  [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.16, 'triangle', 0.28, i * 0.06));
}

export function playTax() {
  [440, 370, 294].forEach((f, i) => tone(f, 0.14, 'sine', 0.2, i * 0.09));
}

export function playCollect() {
  [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.13, 'sine', 0.28, i * 0.05));
}
