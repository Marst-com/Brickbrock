export class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = 0.12;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (
        window.AudioContext ||
        window.webkitAudioContext
      )();
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  tone({
    frequency = 440,
    duration = 0.08,
    type = "sine",
    volume = 0.2,
    slide = 0
  } = {}) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;

    osc.frequency.setValueAtTime(
      frequency,
      this.ctx.currentTime
    );

    if (slide !== 0) {
      osc.frequency.linearRampToValueAtTime(
        frequency + slide,
        this.ctx.currentTime + duration
      );
    }

    gain.gain.setValueAtTime(
      0.0001,
      this.ctx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      volume * this.master,
      this.ctx.currentTime + 0.008
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      this.ctx.currentTime + duration
    );

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(
      this.ctx.currentTime + duration + 0.02
    );
  }

  paddle() {
    this.tone({
      frequency: 240,
      duration: 0.055,
      type: "square",
      volume: 0.16,
      slide: 80
    });
  }

  wall() {
    this.tone({
      frequency: 180,
      duration: 0.045,
      type: "triangle",
      volume: 0.12,
      slide: 40
    });
  }

  brick() {
    this.tone({
      frequency: 520,
      duration: 0.055,
      type: "square",
      volume: 0.12,
      slide: -80
    });
  }

  brickBreak() {
    this.tone({
      frequency: 700,
      duration: 0.08,
      type: "triangle",
      volume: 0.16,
      slide: -220
    });
  }

  bomb() {
    this.tone({
      frequency: 110,
      duration: 0.28,
      type: "sawtooth",
      volume: 0.28,
      slide: -85
    });

    setTimeout(() => {
      this.tone({
        frequency: 55,
        duration: 0.22,
        type: "square",
        volume: 0.22,
        slide: -20
      });
    }, 45);
  }

  powerUp() {
    const notes = [500, 650, 800];

    notes.forEach((frequency, i) => {
      setTimeout(() => {
        this.tone({
          frequency,
          duration: 0.09,
          type: "sine",
          volume: 0.16,
          slide: 80
        });
      }, i * 55);
    });
  }

  duplicate() {
    [440, 660, 880].forEach(
      (frequency, i) => {
        setTimeout(() => {
          this.tone({
            frequency,
            duration: 0.1,
            type: "triangle
