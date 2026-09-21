import { CONFIG } from "./config.js";
import { Ball } from "./Ball.js";
import { Paddle } from "./Paddle.js";
import { Brick } from "./Brick.js";
import { Input } from "./Input.js";
import { Renderer } from "./Renderer.js";

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;

    this.ui = ui;

    this.ball = new Ball();
    this.paddle = new Paddle();

    this.renderer = new Renderer(canvas);

    this.input =
      new Input(canvas, this.paddle);

    this.score = 0;
    this.lives = CONFIG.game.lives;
    this.level = 1;

    this.running = false;
    this.paused = false;

    this.bricks = [];

    this.createLevel();
  }

  createLevel() {
    this.bricks = [];

    const {
      columns,
      rows,
      width,
      height,
      gap,
      top
    } = CONFIG.bricks;

    const totalWidth =
      columns * width +
      (columns - 1) * gap;

    const left =
      (CONFIG.canvas.width - totalWidth) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {

        const hp =
          this.level >= 3 && row < 2
            ? 2
            : 1;

        this.bricks.push(
          new Brick(
            left + col * (width + gap),
            top + row * (height + gap),
            width,
            height,
            hp
          )
        );
      }
    }
  }

  start() {
    if (this.lives <= 0) return;

    this.running = true;
    this.paused = false;

    this.ui.message("게임 시작!");
  }

  togglePause() {
    if (!this.running) return;

    this.paused = !this.paused;

    this.ui.message(
      this.paused
        ? "일시정지"
        : "게임 진행 중"
    );
  }

  update() {
    if (!this.running || this.paused) return;

    this.paddle.move(
      this.input.getDirection()
    );

    this.ball.update();

    this.handleWalls();
    this.handlePaddle();
    this.handleBricks();
    this.handleDeath();
  }

  handleWalls() {
    const { width, height } =
      CONFIG.canvas;

    if (
      this.ball.x - this.ball.radius <= 0 ||
      this.ball.x + this.ball.radius >= width
    ) {
      this.ball.bounceX();
    }

    if (
      this.ball.y - this.ball.radius <= 0
    ) {
      this.ball.bounceY();
    }
  }

  handlePaddle() {
    const b = this.ball;
    const p = this.paddle;

    if (
      b.dy > 0 &&
      b.y + b.radius >= p.y &&
      b.y - b.radius <= p.y + p.height &&
      b.x >= p.x &&
      b.x <= p.x + p.width
    ) {

      const hit =
        (b.x - (p.x + p.width / 2))
        / (p.width / 2);

      b.dx = hit * 7;

      b.dy = -Math.abs(b.dy);
    }
  }

  handleBricks() {
    for (const brick of this.bricks) {

      if (!brick.alive) continue;

      const hit =
        this.ball.x + this.ball.radius > brick.x &&
        this.ball.x - this.ball.radius < brick.x + brick.width &&
        this.ball.y + this.ball.radius > brick.y &&
        this.ball.y - this.ball.radius < brick.y + brick.height;

      if (!hit) continue;

      const destroyed = brick.hit();

      this.ball.bounceY();

      this.score += destroyed ? 10 : 3;

      this.ui.update(
        this.score,
        this.lives,
        this.level
      );

      break;
    }

    if (
      this.bricks.every(
        brick => !brick.alive
      )
    ) {
      this.nextLevel();
    }
  }

  handleDeath() {
    if (
      this.ball.y -
      this.ball.radius <=
      CONFIG.canvas.height
    ) {
      return;
    }

    this.lives--;

    this.ui.update(
      this.score,
      this.lives,
      this.level
    );

    if (this.lives <= 0) {
      this.running = false;
      this.ui.message("GAME OVER");
      return;
    }

    this.ball.reset(this.level);

    this.running = false;

    this.ui.message(
      "공을 놓쳤어! 다시 시작!"
    );
  }

  nextLevel() {
    this.level++;

    if (
      this.level >
      CONFIG.game.maxLevel
    ) {
      this.running = false;
      this.ui.message(
        "🎉 모든 스테이지 클리어!"
      );
      return;
    }

    this.createLevel();
    this.ball.reset(this.level);

    this.running = false;

    this.ui.update(
      this.score,
      this.lives,
      this.level
    );

    this.ui.message(
      `STAGE ${this.level}`
    );
  }

  draw() {
    this.renderer.clear();
    this.renderer.drawBackground();

    for (const brick of this.bricks) {
      this.renderer.drawBrick(brick);
    }

    this.renderer.drawPaddle(
      this.paddle
    );

    this.renderer.drawBall(
      this.ball
    );
  }

  loop() {
    this.update();
    this.draw();

    requestAnimationFrame(
      () => this.loop()
    );
  }

  restart() {
    this.score = 0;
    this.lives = CONFIG.game.lives;
    this.level = 1;

    this.running = false;
    this.paused = false;

    this.paddle.reset();
    this.ball.reset();

    this.createLevel();

    this.ui.update(
      this.score,
      this.lives,
      this.level
    );

    this.ui.message(
      "시작 버튼을 눌러 출발!"
    );
  }
  }
