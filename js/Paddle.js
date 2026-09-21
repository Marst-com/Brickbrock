import { CONFIG } from "./config.js";

export class Paddle {
  constructor() {
    this.width = CONFIG.paddle.width;
    this.height = CONFIG.paddle.height;
    this.speed = CONFIG.paddle.speed;

    this.reset();
  }

  reset() {
    this.x =
      (CONFIG.canvas.width - this.width) / 2;

    this.y =
      CONFIG.canvas.height - 35;
  }

  move(direction) {
    this.x += direction * this.speed;

    this.x = Math.max(
      0,
      Math.min(
        CONFIG.canvas.width - this.width,
        this.x
      )
    );
  }

  moveTo(x) {
    this.x = x - this.width / 2;

    this.x = Math.max(
      0,
      Math.min(
        CONFIG.canvas.width - this.width,
        this.x
      )
    );
  }
}
