export class Input {
  constructor(canvas, paddle) {
    this.keys = new Set();

    window.addEventListener("keydown", e => {
      this.keys.add(e.key.toLowerCase());
    });

    window.addEventListener("keyup", e => {
      this.keys.delete(e.key.toLowerCase());
    });

    canvas.addEventListener("pointermove", e => {
      const rect = canvas.getBoundingClientRect();

      const x =
        ((e.clientX - rect.left) / rect.width)
        * canvas.width;

      paddle.moveTo(x);
    });
  }

  getDirection() {
    if (
      this.keys.has("arrowleft") ||
      this.keys.has("a")
    ) {
      return -1;
    }

    if (
      this.keys.has("arrowright") ||
      this.keys.has("d")
    ) {
      return 1;
    }

    return 0;
  }
  }
