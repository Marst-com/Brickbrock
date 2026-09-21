export class Paddle {
  constructor(canvasWidth, width, height, speed) {
    this.canvasWidth = canvasWidth;

    this.normalWidth = width;
    this.width = width;
    this.height = height;

    this.speed = speed;

    this.reset();
  }

  reset() {
    this.x = (this.canvasWidth - this.width) / 2;
    this.y = 465;
  }

  move(direction) {
    this.x += direction * this.speed;

    this.clamp();
  }

  moveTo(x) {
    this.x = x - this.width / 2;

    this.clamp();
  }

  expand() {
    this.width = 210;
    this.clamp();
  }

  normal() {
    this.width = this.normalWidth;
    this.clamp();
  }

  clamp() {
    this.x = Math.max(
      0,
      Math.min(
        this.canvasWidth - this.width,
        this.x
      )
    );
  }
}
