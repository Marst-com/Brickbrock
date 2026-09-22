export class CanvasManager {
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.width = width;
    this.height = height;

    this.shakeAmount = 0;
    this.flashAlpha = 0;

    this.setup();
  }

  setup() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.ctx.imageSmoothingEnabled = true;
  }

  clear() {
    this.ctx.clearRect(
      0,
      0,
      this.width,
      this.height
    );
  }

  shake(amount = 5) {
    this.shakeAmount = Math.max(
      this.shakeAmount,
      amount
    );
  }

  flash(alpha = 0.18) {
    this.flashAlpha = Math.max(
      this.flashAlpha,
      alpha
    );
  }

  beginFrame() {
    const ctx = this.ctx;

    ctx.save();

    if (this.shakeAmount > 0) {
      const x =
        (Math.random() - 0.5) *
        this.shakeAmount;

      const y =
        (Math.random() - 0.5) *
        this.shakeAmount;

      ctx.translate(x, y);

      this.shakeAmount *= 0.82;

      if (this.shakeAmount < 0.1) {
        this.shakeAmount = 0;
      }
    }
  }

  endFrame() {
    const ctx = this.ctx;

    ctx.restore();

    if (this.flashAlpha > 0) {
      ctx.fillStyle =
        `rgba(255,255,255,${this.flashAlpha})`;

      ctx.fillRect(
        0,
        0,
        this.width,
        this.height
      );

      this.flashAlpha *= 0.78;

      if (this.flashAlpha < 0.01) {
        this.flashAlpha = 0;
      }
    }
  }

  getPointerPosition(event) {
    const rect =
      this.canvas.getBoundingClientRect();

    const scaleX =
      this.width / rect.width;

    const scaleY =
      this.height / rect.height;

    return {
      x:
        (event.clientX - rect.left) *
        scaleX,

      y:
        (event.clientY - rect.top) *
        scaleY
    };
  }
        }
