import { CONFIG } from "./config.js";

export class Ball {
  constructor() {
    this.radius = CONFIG.ball.radius;
    this.reset(1);
  }

  reset(level = 1) {
    this.x = CONFIG.canvas.width / 2;
    this.y = CONFIG.canvas.height - 65;

    const speed = CONFIG.ball.speed + level * 0.35;

    this.dx = (Math.random() < 0.5 ? -1 : 1) * speed;
    this.dy = -speed;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
  }

  bounceX() {
    this.dx *= -1;
  }

  bounceY() {
    this.dy *= -1;
  }
}
