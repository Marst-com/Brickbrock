export class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = 0.12;
    this.enabled = false;
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioContext =
          window.AudioContext ||
          window.webkitAudioContext;

        if (!AudioContext) {
          console.warn(
            "이 브라우저는 Web Audio API를 지원하지 않습니다."
          );
          return;
        }

        this.ctx = new AudioContext();
      }

      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }

      this.enabled = true;
    } catch (error) {
      console.warn(
        "오디오를 초기화할 수 없습니다:",
        error
      );

      this.enabled = false;
    }
  }

  tone({
    frequency = 440,
    duration = 0.08,
    type = "sine",
    volume = 0.2,
    slide = 0
  } = {}) {
    if (!this.enabled || !this.ctx) {
      return;
    }

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;

      const now = this.ctx.currentTime;

      osc.frequency.setValueAtTime(
        frequency,
        now
      );

      if (slide !== 0) {
        osc.frequency.linearRampToValueAtTime(
          frequency + slide,
          now + duration
        );
      }

      gain.gain.setValueAtTime(
        0.0001,
        now
      );

      gain.gain.exponentialRampToValueAtTime(
        Math.max(
          volume * this.master,
          0.0001
        ),
        now + 0.008
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + duration
      );

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (error) {
      console.warn("사운드 재생 실패:", error);
    }
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
    [500, 650, 800].forEach(
      (frequency, i) => {
        setTimeout(() => {
          this.tone({
            frequency,
            duration: 0.09,
            type: "sine",
            volume: 0.16,
            slide: 80
          });
        }, i * 55);
      }
    );
  }

  duplicate() {
    [440, 660, 880].forEach(
      (frequency, i) => {
        setTimeout(() => {
          this.tone({
            frequency,
            duration: 0.1,
            type: "triangle",
            volume: 0.16,
            slide: 100
          });
        }, i * 60);
      }
    );
  }

  expand() {
    this.tone({
      frequency: 300,
      duration: 0.12,
      type: "sine",
      volume: 0.18,
      slide: 500
    });
  }

  fast() {
    this.tone({
      frequency: 800,
      duration: 0.12,
      type: "square",
      volume: 0.14,
      slide: 500
    });
  }

  slow() {
    this.tone({
      frequency: 700,
      duration: 0.2,
      type: "sine",
      volume: 0.16,
      slide: -400
    });
  }

  life() {
    [500, 700, 900].forEach(
      (frequency, i) => {
        setTimeout(() => {
          this.tone({
            frequency,
            duration: 0.13,
            type: "sine",
            volume: 0.18,
            slide: 50
          });
        }, i * 80);
      }
    );
  }

  loseLife() {
    this.tone({
      frequency: 300,
      duration: 0.18,
      type: "sawtooth",
      volume: 0.18,
      slide: -180
    });

    setTimeout(() => {
      this.tone({
        frequency: 150,
        duration: 0.22,
        type: "sawtooth",
        volume: 0.15,
        slide: -80
      });
    }, 100);
  }

  gameOver() {
    [400, 320, 240, 160].forEach(
      (frequency, i) => {
        setTimeout(() => {
          this.tone({
            frequency,
            duration: 0.18,
            type: "triangle",
            volume: 0.18,
            slide: -30
          });
        }, i * 130);
      }
    );
  }

  levelUp() {
    [400, 500, 650, 850].forEach(
      (frequency, i) => {
        setTimeout(() => {
          this.tone({
            frequency,
            duration: 0.11,
            type: "sine",
            volume: 0.18,
            slide: 70
          });
        }, i * 75);
      }
    );
  }
}
