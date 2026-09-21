import { CONFIG } from "./config.js";
import { Ball } from "./Ball.js";
import { Paddle } from "./Paddle.js";
import { Brick } from "./Brick.js";
import { PowerUp } from "./PowerUp.js";
import { Particle } from "./Particle.js";
import { Renderer } from "./Renderer.js";
import { Input } from "./Input.js";

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.ui = ui;

    this.renderer = new Renderer(this.ctx);
    this.input = new Input(canvas);

    this.paddle = new Paddle(
      CONFIG.canvas.width,
      CONFIG.paddle.width,
      CONFIG.paddle.height,
      CONFIG.paddle.speed
    );

    this.balls = [];

    this.bricks = [];
    this.powerUps = [];
    this.particles = [];

    this.score = 0;
    this.lives = CONFIG.lives;
    this.level = 1;

    this.running = false;
    this.paused = false;

    this.createLevel();
    this.updateUI();
  }

  createLevel() {
    this.bricks = [];

    const {
      rows,
      cols,
      width,
      height,
      gap,
      top
    } = CONFIG.brick;

    const totalWidth =
      cols * width +
      (cols - 1) * gap;

    const startX =
      (CONFIG.canvas.width - totalWidth) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x =
          startX +
          col * (width + gap);

        const y =
          top +
          row * (height + gap);

        let type = "normal";
        let hp = Math.min(row + 1, 3);

        // 폭탄
        if (
          row > 0 &&
          Math.random() < 0.12
        ) {
          type = "bomb";
          hp = 1;
        }

        this.bricks.push(
          new Brick(
            x,
            y,
            width,
            height,
            type,
            hp
          )
        );
      }
    }
  }

  start() {
    this.running = true;
    this.paused = false;

    this.resetBalls();

    this.ui.message.textContent =
      "게임 시작!";

    this.loop();
  }

  resetBalls() {
    this.balls = [
      new Ball(
        CONFIG.canvas.width / 2,
        430,
        CONFIG.ball.radius,
        CONFIG.ball.speed
      )
    ];
  }

  togglePause() {
    if (!this.running) return;

    this.paused = !this.paused;

    this.ui.message.textContent =
      this.paused
        ? "⏸ 일시정지"
        : "▶ 진행 중";
  }

  restart() {
    this.score = 0;
    this.lives = CONFIG.lives;
    this.level = 1;

    this.powerUps = [];
    this.particles = [];

    this.paddle.normal();

    this.createLevel();
    this.resetBalls();

    this.running = false;
    this.paused = false;

    this.updateUI();
  }

  update() {
    if (!this.running || this.paused) return;

    // 패들
    if (this.input.left) {
      this.paddle.move(-1);
    }

    if (this.input.right) {
      this.paddle.move(1);
    }

    if (this.input.pointerActive) {
      this.paddle.moveTo(this.input.pointerX);
    }

    // 공
    for (const ball of this.balls) {
      ball.update();

      this.handleWalls(ball);
      this.handlePaddle(ball);
      this.handleBricks(ball);
    }

    // 공 제거
    this.balls =
      this.balls.filter(ball => ball.alive);

    if (this.balls.length === 0) {
      this.loseLife();
    }

    // 파워업
    for (const powerUp of this.powerUps) {
      powerUp.update();

      if (
        powerUp.active &&
        this.collidesPowerUp(powerUp)
      ) {
        this.activatePowerUp(powerUp);
        powerUp.active = false;
      }
    }

    this.powerUps =
      this.powerUps.filter(p => p.active);

    // 파티클
    for (const particle of this.particles) {
      particle.update();
    }

    this.particles =
      this.particles.filter(
        p => !p.dead
      );

    // 다음 스테이지
    if (
      this.bricks.every(
        brick => brick.destroyed
      )
    ) {
      this.nextLevel();
    }

    this.updateUI();
  }

  handleWalls(ball) {
    if (
      ball.x - ball.radius <= 0 ||
      ball.x + ball.radius >= CONFIG.canvas.width
    ) {
      ball.bounceX();
    }

    if (ball.y - ball.radius <= 0) {
      ball.bounceY();
    }

    if (
      ball.y > CONFIG.canvas.height + 30
    ) {
      ball.alive = false;
    }
  }

  handlePaddle(ball) {
    const hit =
      ball.x > this.paddle.x &&
      ball.x <
        this.paddle.x + this.paddle.width &&
      ball.y + ball.radius >= this.paddle.y &&
      ball.y - ball.radius <=
        this.paddle.y + this.paddle.height &&
      ball.dy > 0;

    if (!hit) return;

    const center =
      this.paddle.x +
      this.paddle.width / 2;

    const offset =
      (ball.x - center) /
      (this.paddle.width / 2);

    ball.dy = -Math.abs(ball.dy);
    ball.dx = offset * ball.speed;
  }

  handleBricks(ball) {
    for (const brick of this.bricks) {
      if (brick.destroyed) continue;

      const hit =
        ball.x + ball.radius > brick.x &&
        ball.x - ball.radius <
          brick.x + brick.width &&
        ball.y + ball.radius > brick.y &&
        ball.y - ball.radius <
          brick.y + brick.height;

      if (!hit) continue;

      if (!ball.piercing) {
        ball.bounceY();
      }

      const destroyed = brick.hit();

      if (destroyed) {
        this.score += 100;

        this.createParticles(
          brick.x + brick.width / 2,
          brick.y + brick.height / 2,
          brick.getColor()
        );

        // 폭탄
        if (brick.type === "bomb") {
          this.explode(brick);
        }

        // 25% 확률 파워업
        if (Math.random() < 0.25) {
          this.spawnPowerUp(brick);
        }
      } else {
        this.score += 25;
      }

      break;
    }
  }

  explode(source) {
    for (const brick of this.bricks) {
      if (brick.destroyed || brick === source) {
        continue;
      }

      const dx =
        brick.x - source.x;

      const dy =
        brick.y - source.y;

      const distance =
        Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        brick.destroyed = true;
        this.score += 100;

        this.createParticles(
          brick.x + brick.width / 2,
          brick.y + brick.height / 2,
          brick.getColor()
        );
      }
    }

    this.createParticles(
      source.x + source.width / 2,
      source.y + source.height / 2,
      "#ef4444",
      35
    );
  }

  spawnPowerUp(brick) {
    const types = [
      "duplicate",
      "expand",
      "fast",
      "slow",
      "life"
    ];

    const type =
      types[
        Math.floor(
          Math.random() * types.length
        )
      ];

    this.powerUps.push(
      new PowerUp(
        brick.x + brick.width / 2,
        brick.y + brick.height / 2,
        type
      )
    );
  }

  collidesPowerUp(powerUp) {
    return (
      powerUp.x >
        this.paddle.x &&
      powerUp.x <
        this.paddle.x +
          this.paddle.width &&
      powerUp.y +
        powerUp.size / 2 >
        this.paddle.y &&
      powerUp.y -
        powerUp.size / 2 <
        this.paddle.y +
          this.paddle.height
    );
  }

  activatePowerUp(powerUp) {
    switch (powerUp.type) {
      case "duplicate":
        this.duplicateBalls();
        break;

      case "expand":
        this.paddle.expand();

        setTimeout(() => {
          this.paddle.normal();
        }, 7000);

        break;

      case "fast":
        for (const ball of this.balls) {
          ball.setSpeed(1.5);
        }
        break;

      case "slow":
        for (const ball of this.balls) {
          ball.setSpeed(0.7);
        }
        break;

      case "life":
        this.lives++;
        break;
    }

    this.score += 50;
  }

  duplicateBalls() {
    const originals = [...this.balls];

    for (const original of originals) {
      if (this.balls.length >= 5) {
        break;
      }

      const clone = new Ball(
        original.x,
        original.y,
        original.radius,
        original.speed
      );

      clone.dx = -original.dx;
      clone.dy = original.dy;

      this.balls.push(clone);
    }
  }

  loseLife() {
    this.lives--;

    if (this.lives <= 0) {
      this.running = false;

      this.ui.message.textContent =
        `GAME OVER — 점수 ${this.score}`;

      return;
    }

    this.resetBalls();

    this.ui.message.textContent =
      `목숨 감소! 남은 목숨: ${this.lives}`;
  }

  nextLevel() {
    this.level++;

    this.createLevel();
    this.resetBalls();

    this.score += 500;

    this.ui.message.textContent =
      `🎉 LEVEL ${this.level}`;
  }

  createParticles(
    x,
    y,
    color,
    amount = 12
  ) {
    for (let i = 0; i < amount; i++) {
      this.particles.push(
        new Particle(
          x,
          y,
          color
        )
      );
    }
  }

  updateUI() {
    this.ui.score.textContent =
      this.score;

    this.ui.lives.textContent =
      this.lives;

    this.ui.level.textContent =
      this.level;
  }

  draw() {
    this.renderer.clear(
      CONFIG.canvas.width,
      CONFIG.canvas.height
    );

    this.renderer.background(
      CONFIG.canvas.width,
      CONFIG.canvas.height
    );

    for (const brick of this.bricks) {
      if (!brick.destroyed) {
        this.renderer.brick(brick);
      }
    }

    for (const powerUp of this.powerUps) {
      this.renderer.powerUp(powerUp);
    }

    this.renderer.paddle(
      this.paddle
    );

    for (const ball of this.balls) {
      this.renderer.ball(ball);
    }

    for (const particle of this.particles) {
      this.renderer.particle(particle);
    }
  }

  loop() {
    this.update();
    this.draw();

    requestAnimationFrame(
      () => this.loop()
    );
  }
}
