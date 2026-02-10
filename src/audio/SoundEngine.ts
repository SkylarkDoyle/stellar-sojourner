const audioCtx = new (
  window.AudioContext || (window as any).webkitAudioContext
)();

let engineOsc: OscillatorNode | null = null;
let engineGain: GainNode | null = null;
let isEngineRunning = false;

function ensureContext() {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

export function startEngineHum() {
  if (isEngineRunning) return;
  ensureContext();

  engineOsc = audioCtx.createOscillator();
  engineGain = audioCtx.createGain();

  engineOsc.type = "sawtooth";
  engineOsc.frequency.setValueAtTime(45, audioCtx.currentTime);
  engineGain.gain.setValueAtTime(0, audioCtx.currentTime);
  engineGain.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 2);

  engineOsc.connect(engineGain);
  engineGain.connect(audioCtx.destination);
  engineOsc.start();
  isEngineRunning = true;
}

export function setEngineIntensity(
  intensity: "idle" | "charging" | "jumping" | "cooling",
) {
  if (!engineOsc || !engineGain) return;
  ensureContext();

  const now = audioCtx.currentTime;
  switch (intensity) {
    case "idle":
      engineOsc.frequency.linearRampToValueAtTime(45, now + 0.5);
      engineGain.gain.linearRampToValueAtTime(0.03, now + 0.5);
      break;
    case "charging":
      engineOsc.frequency.linearRampToValueAtTime(80, now + 1);
      engineGain.gain.linearRampToValueAtTime(0.06, now + 1);
      break;
    case "jumping":
      engineOsc.frequency.linearRampToValueAtTime(200, now + 0.3);
      engineGain.gain.linearRampToValueAtTime(0.1, now + 0.3);
      break;
    case "cooling":
      engineOsc.frequency.linearRampToValueAtTime(60, now + 2);
      engineGain.gain.linearRampToValueAtTime(0.04, now + 2);
      break;
  }
}

export function playWarpEngage() {
  ensureContext();

  // Rising sweep
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(100, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 2.5);
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 3);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 3);

  // Impact thump
  const thump = audioCtx.createOscillator();
  const thumpGain = audioCtx.createGain();
  thump.type = "sine";
  thump.frequency.setValueAtTime(60, audioCtx.currentTime + 2.5);
  thump.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 3.5);
  thumpGain.gain.setValueAtTime(0, audioCtx.currentTime);
  thumpGain.gain.setValueAtTime(0.15, audioCtx.currentTime + 2.5);
  thumpGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 3.5);

  thump.connect(thumpGain);
  thumpGain.connect(audioCtx.destination);
  thump.start();
  thump.stop(audioCtx.currentTime + 4);
}

export function playWarpExit() {
  ensureContext();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1500, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 1.5);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 2);
}

export function playUIClick() {
  ensureContext();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.03);
  gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}

export function playAlert() {
  ensureContext();

  for (let i = 0; i < 3; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    const start = audioCtx.currentTime + i * 0.25;
    osc.frequency.setValueAtTime(1200, start);
    gain.gain.setValueAtTime(0.05, start);
    gain.gain.linearRampToValueAtTime(0, start + 0.15);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + 0.2);
  }
}
