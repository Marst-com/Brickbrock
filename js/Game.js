import { CONFIG } from "./config.js";
import { Ball } from "./Ball.js";
import { Paddle } from "./Paddle.js";
import { Brick } from "./Brick.js";
import { PowerUp } from "./PowerUp.js";
import { Particle } from "./Particle.js";
import { Renderer } from "./Renderer.js";
import { Input } from "./Input.js";
import { AudioManager } from "./Audio.js";

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.ui = ui;

    this.renderer = new Renderer(this.ctx);
    this.input = new Input(canvas);
    this.audio = new AudioManager();

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

    // 부활 카운트다운
    this.respawning = false;
    this.respawnTime = 0;

    this.createLevel();
    this.resetBalls();
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

        /*
          1스테이지 기준

          맨 위    → HP 1
          2번째    → HP 1
          3번째    → HP 2
          4번째    → HP 2
          5번째    → HP 3
          맨 아래  → HP 3

          스테이지가 올라가면
          전체적으로 조금씩 강해짐.
        */

        const hp = Math.min(
          1 +
            Math.floor(
              (row + this.level - 1) / 2
            ),
          3
        );

        let type = "normal";

        // 폭탄 벽돌
        if (
          row >= 1 &&
          Math.random() < 0.12
        ) {
          type = "bomb";
        }

        this.bricks.push(
          new Brick(
            x,
            y,
            width,
            height,
            type,
            type === "bomb" ? 1 : hp
          )
        );
      }
    }
  }

  start() {
    try {
      this.audio.init();
    } catch (error) {
      console.warn(
        "오디오 초기화 실패:",
        error
      );
    }

    if (this.running) {
      if (this.paused) {
        this.paused = false;
        this.ui.message.textContent =
          "▶ 게임 진행 중";
      }

      return;
    }

    this.running = true;
    this.paused = false;

    if (this.balls.length === 0) {
      this.resetBalls();
    }

    this.ui.message.textContent =
      "게임 시작!";

    this.loop();
  }

  resetBalls() {
    const speed =
      CONFIG.ball.speed +
      Math.min(
        this.level - 1,
        8
      ) * 0.35;

    this.balls = [
      new Ball(
        CONFIG.canvas.width / 2,
        CONFIG.canvas.height - 70,
        CONFIG.ball.radius,
        speed
      )
    ];
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

      clone.dy =
        original.dy +
        (Math.random() - 0.5) * 1.5;

      clone.piercing =
        original.piercing;

      this.balls.push(clone);
    }

    this.createParticles(
      CONFIG.canvas.width / 2,
      CONFIG.canvas.height / 2,
      "#22d3ee",
      25
    );
  }

  togglePause() {
    if (
      !this.running ||
      this.respawning
    ) {
      return;
    }

    this.paused = !this.paused;

    this.ui.message.textContent =
      this.paused
        ? "⏸ 일시정지"
        : "▶ 게임 진행 중";
  }

  restart() {
    try {
      this.audio.init();
    } catch {}

    this.score = 0;
    this.lives = CONFIG.lives;
    this.level = 1;

    this.running = false;
    this.paused = false;

    this.respawning = false;
    this.respawnTime = 0;

    this.balls = [];
    this.powerUps = [];
    this.particles = [];

    this.paddle.normal();
    this.paddle.reset();

    this.createLevel();
    this.resetBalls();

    this.ui.message.textContent =
      "시작 버튼을 눌러 출발!";

    this.updateUI();
    this.draw();
  }

  update() {
    if (
      !this.running ||
      this.paused
    ) {
      return;
    }

    // 부활 카운트다운
    if (this.respawning) {
      this.updateRespawn();
      this.updateParticles();
      return;
    }

    this.updatePaddle();
    this.updateBalls();
    this.updatePowerUps();
    this.updateParticles();

    this.checkLevelClear();
    this.updateUI();
  }

  updateRespawn() {
    this.respawnTime -= 1 / 60;

    const seconds = Math.ceil(
      this.respawnTime
    );

    if (seconds > 0) {
      this.ui.message.textContent =
        `💔 부활까지 ${seconds}초...`;
    }

    if (this.respawnTime <= 0) {
      this.respawning = false;

      this.resetBalls();
      this.paddle.reset();

      this.ui.message.textContent =
        "🔥 부활!";

      this.createParticles(
        this.paddle.x +
          this.paddle.width / 2,
        this.paddle.y,
        "#22c55e",
        25
      );
    }
  }

  updatePaddle() {
    if (this.input.left) {
      this.paddle.move(-1);
    }

    if (this.input.right) {
      this.paddle.move(1);
    }

    if (this.input.pointerActive) {
      this.paddle.moveTo(
        this.input.pointerX
      );
    }
  }

  updateBalls() {
    for (const ball of this.balls) {
      if (!ball.alive) {
        continue;
      }

      ball.update();

      this.handleWalls(ball);

      if (!ball.alive) {
        continue;
      }

      this.handlePaddle(ball);

      if (!ball.alive) {
        continue;
      }

      this.handleBricks(ball);
    }

    this.balls =
      this.balls.filter(
        ball => ball.alive
      );

    if (this.balls.length === 0) {
      this.loseLife();
    }
  }

  handleWalls(ball) {
    if (
      ball.x - ball.radius <= 0
    ) {
      ball.x = ball.radius;
      ball.bounceX();
      this.audio.wall();
    }

    if (
      ball.x + ball.radius >=
      CONFIG.canvas.width
    ) {
      ball.x =
        CONFIG.canvas.width -
        ball.radius;

      ball.bounceX();
      this.audio.wall();
    }

    if (
      ball.y - ball.radius <= 0
    ) {
      ball.y = ball.radius;
      ball.bounceY();
      this.audio.wall();
    }

    if (
      ball.y - ball.radius >
      CONFIG.canvas.height
    ) {
      ball.alive = false;
    }
  }

  handlePaddle(ball) {
    const hit =
      ball.x + ball.radius >
        this.paddle.x &&
      ball.x - ball.radius <
        this.paddle.x +
          this.paddle.width &&
      ball.y + ball.radius >=
        this.paddle.y &&
      ball.y - ball.radius <=
        this.paddle.y +
          this.paddle.height &&
      ball.dy > 0;

    if (!hit) {
      return;
    }

    ball.y =
      this.paddle.y -
      ball.radius;

    const center =
      this.paddle.x +
      this.paddle.width / 2;

    const offset =
      (ball.x - center) /
      (this.paddle.width / 2);

    const limitedOffset =
      Math.max(
        -0.92,
        Math.min(0.92, offset)
      );

    const speed =
      Math.sqrt(
        ball.dx * ball.dx +
        ball.dy * ball.dy
      );

    ball.dx =
      limitedOffset * speed;

    ball.dy =
      -Math.sqrt(
        speed * speed -
        ball.dx * ball.dx
      );

    this.audio.paddle();

    if (
      ball.speed <
      CONFIG.ball.maxSpeed
    ) {
      ball.speed = Math.min(
        ball.speed + 0.03,
        CONFIG.ball.maxSpeed
      );
    }
  }

  handleBricks(ball) {
    for (const brick of this.bricks) {
      if (brick.destroyed) {
        continue;
      }

      const hit =
        ball.x + ball.radius >
          brick.x &&
        ball.x - ball.radius <
          brick.x +
            brick.width &&
        ball.y + ball.radius >
          brick.y &&
        ball.y - ball.radius <
          brick.y +
            brick.height;

      if (!hit) {
        continue;
      }

      if (!ball.piercing) {
        this.resolveBrickBounce(
          ball,
          brick
        );
      }

      const destroyed =
        brick.hit();

      if (destroyed) {
        this.destroyBrick(brick);
      } else {
        this.score += 25;
        this.audio.brick();
      }

      if (!ball.piercing) {
        break;
      }
    }
  }

  resolveBrickBounce(ball, brick) {
    const dx =
      ball.x -
      (brick.x + brick.width / 2);

    const dy =
      ball.y -
      (brick.y + brick.height / 2);

    const overlapX =
      brick.width / 2 +
      ball.radius -
      Math.abs(dx);

    const overlapY =
      brick.height / 2 +
      ball.radius -
      Math.abs(dy);

    if (overlapX < overlapY) {
      ball.bounceX();

      ball.x =
        dx > 0
          ? brick.x +
            brick.width +
            ball.radius
          : brick.x -
            ball.radius;
    } else {
      ball.bounceY();

      ball.y =
        dy > 0
          ? brick.y +
            brick.height +
            ball.radius
          : brick.y -
            ball.radius;
    }
  }

  destroyBrick(brick) {
    brick.destroyed = true;

    this.score += 100;

    this.audio.brickBreak();

    this.createParticles(
      brick.x +
        brick.width / 2,
      brick.y +
        brick.height / 2,
      brick.getColor(),
      18
    );

    if (brick.type === "bomb") {
      this.audio.bomb();
      this.explode(brick);
    }

    // 기존 28% → 45%
    if (
      Math.random() <
      CONFIG.brick.dropRate
    ) {
      this.spawnPowerUp(brick);
    }
  }

  explode(source) {
    const radius = 115;

    this.createParticles(
      source.x +
        source.width / 2,
      source.y +
        source.height / 2,
      "#ef4444",
      45
    );

    for (const brick of this.bricks) {
      if (
        brick === source ||
        brick.destroyed
      ) {
        continue;
      }

      const sourceX =
        source.x +
        source.width / 2;

      const sourceY =
        source.y +
        source.height / 2;

      const brickX =
        brick.x +
        brick.width / 2;

      const brickY =
        brick.y +
        brick.height / 2;

      const dx =
        brickX - sourceX;

      const dy =
        brickY - sourceY;

      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );

      if (distance <= radius) {
        brick.destroyed = true;

        this.score += 100;

        this.createParticles(
          brickX,
          brickY,
          brick.getColor(),
          10
        );
      }
    }
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
          Math.random() *
            types.length
        )
      ];

    this.powerUps.push(
      new PowerUp(
        brick.x +
          brick.width / 2,
        brick.y +
          brick.height / 2,
        type
      )
    );
  }

  updatePowerUps() {
    for (const powerUp of this.powerUps) {
      if (!powerUp.active) {
        continue;
      }

      powerUp.update();

      if (
        powerUp.active &&
        this.collidesPowerUp(powerUp)
      ) {
        this.activatePowerUp(
          powerUp
        );

        powerUp.active = false;
      }
    }

    this.powerUps =
      this.powerUps.filter(
        powerUp =>
          powerUp.active
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
    this.audio.powerUp();

    this.createParticles(
      powerUp.x,
      powerUp.y,
      "#ffffff",
      18
    );

    switch (powerUp.type) {
      case "duplicate":
        this.duplicateBalls();
        this.audio.duplicate();
        break;

      case "expand":
        this.paddle.expand();
        this.audio.expand();

        setTimeout(() => {
          this.paddle.normal();
        }, 7000);

        break;

      case "fast":
        for (const ball of this.balls) {
          ball.setSpeed(1.5);
        }

        this.audio.fast();
        break;

      case "slow":
        for (const ball of this.balls) {
          ball.setSpeed(0.7);
        }

        this.audio.slow();
        break;

      case "life":
        this.lives++;
        this.audio.life();
        break;
    }

    this.score += 50;
  }

  loseLife() {
    this.lives--;

    if (this.lives <= 0) {
      this.audio.gameOver();

      this.running = false;
      this.paused = false;
      this.respawning = false;

      this.ui.message.textContent =
        `GAME OVER — 점수 ${this.score}`;

      this.updateUI();

      return;
    }

    this.audio.loseLife();

    this.balls = [];

    this.paddle.normal();
    this.paddle.reset();

    // 3초 대기
    this.respawning = true;
    this.respawnTime =
      CONFIG.respawn.countdown;

    this.ui.message.textContent =
      `💔 부활까지 ${CONFIG.respawn.countdown}초...`;

    this.updateUI();
  }

  checkLevelClear() {
    const remaining =
      this.bricks.some(
        brick =>
          !brick.destroyed
      );

    if (!remaining) {
      this.nextLevel();
    }
  }

  nextLevel() {
    this.level++;

    this.score += 500;

    this.audio.levelUp();

    this.powerUps = [];

    this.paddle.normal();
    this.paddle.reset();

    this.createLevel();
    this.resetBalls();

    this.ui.message.textContent =
      `🎉 STAGE ${this.level}! +500`;

    this.updateUI();
  }

  createParticles(
    x,
    y,
    color,
    amount = 12
  ) {
    for (
      let i = 0;
      i < amount;
      i++
    ) {
      this.particles.push(
        new Particle(
          x,
          y,
          color
        )
      );
    }
  }

  updateParticles() {
    for (const particle of this.particles) {
      particle.update();
    }

    this.particles =
      this.particles.filter(
        particle =>
          !particle.dead
      );
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

    this.renderer.paddle(this.paddle);

    for (const ball of this.balls) {
      this.renderer.ball(ball);
    }

    for (const particle of this.particles) {
      this.renderer.particle(particle);
    }

    // 부활 카운트다운을 게임 화면에도 표시
    if (this.respawning) {
      this.renderer.countdown(
        Math.ceil(this.respawnTime)
      );
    }
  }

  loop(timestamp = 0) {
    if (!this.running) {
      this.draw();
      return;
    }

    this.update();
    this.draw();

    requestAnimationFrame(
      time => this.loop(time)
    );
  }
}
