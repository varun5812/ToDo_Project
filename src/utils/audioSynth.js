// Web Audio API generator for ambient soundscapes & task celebration chimes
// 100% client-side, zero dependencies, works offline

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Celebration chime when a task is completed
export function playTaskDoneChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.45);
    });
  } catch (e) {
    console.warn("Audio chime error:", e);
  }
}

// Click sound for buttons / status toggle
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
}

// Ambient Soundscape Generators (Rain, White Noise, Binaural 40Hz)
let currentAmbientNode = null;
let currentAmbientGain = null;

export function stopAmbientSound() {
  if (currentAmbientGain && audioCtx) {
    currentAmbientGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    setTimeout(() => {
      if (currentAmbientNode) {
        try {
          if (currentAmbientNode.stop) currentAmbientNode.stop();
          currentAmbientNode.disconnect();
        } catch (e) {}
        currentAmbientNode = null;
      }
      currentAmbientGain = null;
    }, 600);
  }
}

export function playAmbientSound(type, volume = 0.2) {
  stopAmbientSound();
  if (type === 'none') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.5);
  gain.connect(ctx.destination);
  currentAmbientGain = gain;

  if (type === 'whitenoise' || type === 'rain') {
    // Generate buffer of pink/brownian noise for rain
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Low pass filter for soothing rain/pink sound
      output[i] = (lastOut + 0.04 * white) / 1.04;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate rain drops
    const filter = ctx.createBiquadFilter();
    filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
    filter.frequency.value = type === 'rain' ? 800 : 1200;

    whiteNoise.connect(filter);
    filter.connect(gain);
    whiteNoise.start(ctx.currentTime);
    currentAmbientNode = whiteNoise;
  } else if (type === 'binaural40hz') {
    // 40Hz Gamma frequency for peak concentration and flow state
    const oscLeft = ctx.createOscillator();
    const oscRight = ctx.createOscillator();
    const merger = ctx.createChannelMerger(2);

    oscLeft.type = 'sine';
    oscLeft.frequency.value = 200; // Base carrier frequency

    oscRight.type = 'sine';
    oscRight.frequency.value = 240; // 240Hz - 200Hz = 40Hz binaural beat

    oscLeft.connect(merger, 0, 0);
    oscRight.connect(merger, 0, 1);
    merger.connect(gain);

    oscLeft.start(ctx.currentTime);
    oscRight.start(ctx.currentTime);

    currentAmbientNode = {
      stop: () => {
        oscLeft.stop();
        oscRight.stop();
      },
      disconnect: () => {
        oscLeft.disconnect();
        oscRight.disconnect();
        merger.disconnect();
      }
    };
  }
}
