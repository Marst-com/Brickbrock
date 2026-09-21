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

    // 시스템
    this.renderer = new Renderer(this.ctx);
    this.input = new Input(canvas);
    this.audio = new AudioManager();

    // 게임 객체
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

    // 게임 상태
    this.score = 0;
    this.lives = CONFIG.lives;
    this.level = 1;

    this.running = false;
    this.paused = false;

    this.lastTime = 0;

    this.createLevel();
    this.resetBalls();
    this.updateUI();
  }

  // =========================
  // LEVEL
  // =========================

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

        // 기본 HP
        let hp =
          Math.min(
            1 +
              Math.floor(
                (row + this.level - 1) / 2
              ),
            3
          );

        // 폭탄 벽돌
        if (
          row >= 1 &&
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

  // =========================
  // GAME START
  // =========================

start() {
  // 오디오 오류가 게임 시작을 막지 않도록 함
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

  // =========================
  // BALL
  // =========================

  resetBalls() {
    this.balls = [
      new Ball(
        CONFIG.canvas.width / 2,
        CONFIG.canvas.height - 70,
        CONFIG.ball.radius,
        CONFIG.ball.speed +
          Math.min(this.level - 1, 4) * 0.25
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

      // 약간 다른 각도로 분리
      clone.dy =
        original.dy +
        (Math.random() - 0.5) * 1.5;

      clone.piercing = original.piercing;

      this.balls.push(clone);
    }

    this.createParticles(
      CONFIG.canvas.width / 2,
      CONFIG.canvas.height / 2,
      "#22d3ee",
      25
    );
  }

  // =========================
  // PAUSE
  // =========================

  togglePause() {
    if (!this.running) {
      return;
    }

    this.paused = !this.paused;

    if (this.paused) {
      this.ui.message.textContent =
        "⏸ 일시정지";
    } else {
      this.ui.message.textContent =
        "▶ 게임 진행 중";
    }
  }

  // =========================
  // RESTART
  // =========================

  restart() {
    this.audio.init();

    this.score = 0;
    this.lives = CONFIG.lives;
    this.level = 1;

    this.running = false;
    this.paused = false;

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

  // =========================
  // UPDATE
  // =========================

  update() {
    if (!this.running || this.paused) {
      return;
    }

    this.updatePaddle();
    this.updateBalls();
    this.updatePowerUps();
    this.updateParticles();

    this.checkLevelClear();

    this.updateUI();
  }

  // =========================
  // PADDLE
  // =========================

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

  // =========================
  // BALLS
  // =========================

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

    // 공이 전부 사라짐
    if (this.balls.length === 0) {
      this.loseLife();
    }
  }

  // =========================
  // WALL COLLISION
  // =========================

  handleWalls(ball) {
    // 왼쪽 / 오른쪽 벽
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

    // 위쪽 벽
    if (
      ball.y - ball.radius <= 0
    ) {
      ball.y = ball.radius;
      ball.bounceY();
      this.audio.wall();
    }

    // 아래로 떨어짐
    if (
      ball.y - ball.radius >
      CONFIG.canvas.height
    ) {
      ball.alive = false;
    }
  }

  // =========================
  // PADDLE COLLISION
  // =========================

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

    // 공을 패들 위로 이동시켜
    // 한 프레임에 여러 번 충돌하는 것을 방지
    ball.y =
      this.paddle.y -
      ball.radius;

    const center =
      this.paddle.x +
      this.paddle.width / 2;

    const offset =
      (ball.x - center) /
      (this.paddle.width / 2);

    // 너무 수직으로 가지 않도록 제한
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

    // 살짝 빨라짐
    if (ball.speed < CONFIG.ball.maxSpeed) {
      ball.speed = Math.min(
        ball.speed + 0.03,
        CONFIG.ball.maxSpeed
      );
    }
  }

  // =========================
  // BRICK COLLISION
  // =========================

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

      // 일반 공이면 튕김
      if (!ball.piercing) {
        this.resolveBrickBounce(
          ball,
          brick
        );
      }

      const destroyed =
        brick.hit();

      if (destroyed) {
        this.destroyBrick(
          brick
        );
      } else {
        this.score += 25;

        this.audio.brick();
      }

      // 한 프레임에 공이 여러 벽돌을
      // 이상하게 관통하지 않도록 종료
      if (!ball.piercing) {
        break;
      }
    }
  }

  // =========================
  // BRICK BOUNCE
  // =========================

  resolveBrickBounce(
    ball,
    brick
  ) {
    const ballCenterX =
      ball.x;

    const ballCenterY =
      ball.y;

    const brickCenterX =
      brick.x +
      brick.width / 2;

    const brickCenterY =
      brick.y +
      brick.height / 2;

    const dx =
      ballCenterX -
      brickCenterX;

    const dy =
      ballCenterY -
      brickCenterY;

    const overlapX =
      brick.width / 2 +
      ball.radius -
      Math.abs(dx);

    const overlapY =
      brick.height / 2 +
      ball.radius -
      Math.abs(dy);

    if (
      overlapX < overlapY
    ) {
      ball.bounceX();

      if (dx > 0) {
        ball.x =
          brick.x +
          brick.width +
          ball.radius;
      } else {
        ball.x =
          brick.x -
          ball.radius;
      }
    } else {
      ball.bounceY();

      if (dy > 0) {
        ball.y =
          brick.y +
          brick.height +
          ball.radius;
      } else {
        ball.y =
          brick.y -
          ball.radius;
      }
    }
  }

  // =========================
  // DESTROY BRICK
  // =========================

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
      15
    );

    // 폭탄
    if (
      brick.type === "bomb"
    ) {
      this.audio.bomb();
      this.explode(brick);
    }

    // 파워업 생성
    if (
      Math.random() < 0.28
    ) {
      this.spawnPowerUp(brick);
    }
  }

  // =========================
  // BOMB
  // =========================

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

  // =========================
  // POWER UPS
  // =========================

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
        this.collidesPowerUp(
          powerUp
        )
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

    switch (
      powerUp.type
    ) {
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
        for (
          const ball of this.balls
        ) {
          ball.setSpeed(1.5);
        }

        this.audio.fast();
        break;

      case "slow":
        for (
          const ball of this.balls
        ) {
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

  // =========================
  // LIFE
  // =========================

  loseLife() {
    this.lives--;

    if (this.lives <= 0) {
      this.audio.gameOver();

      this.running = false;
      this.paused = false;

      this.ui.message.textContent =
        `GAME OVER — 점수 ${this.score}`;

      this.updateUI();

      return;
    }

    this.audio.loseLife();

    this.paddle.normal();
    this.paddle.reset();

    this.resetBalls();

    this.ui.message.textContent =
      `💔 목숨 감소! 남은 목숨: ${this.lives}`;

    this.updateUI();
  }

  // =========================
  // LEVEL CLEAR
  // =========================

  checkLevelClear() {
    const remaining =
      this.bricks.some(
        brick =>
          !brick.destroyed
      );

    if (remaining) {
      return;
    }

    this.nextLevel();
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

  // =========================
  // PARTICLES
  // =========================

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
    for (
      const particle of
      this.particles
    ) {
      particle.update();
    }

    this.particles =
      this.particles.filter(
        particle =>
          !particle.dead
      );
  }

  // =========================
  // UI
  // =========================

  updateUI() {
    this.ui.score.textContent =
      this.score;

    this.ui.lives.textContent =
      this.lives;

    this.ui.level.textContent =
      this.level;
  }

  // =========================
  // DRAW
  // =========================

  draw() {
    this.renderer.clear(
      CONFIG.canvas.width,
      CONFIG.canvas.height
    );

    this.renderer.background(
      CONFIG.canvas.width,
      CONFIG.canvas.height
    );

    // 벽돌
    for (
      const brick of this.bricks
    ) {
      if (!brick.destroyed) {
        this.renderer.brick(
          brick
        );
      }
    }

    // 파워업
    for (
      const powerUp of
      this.powerUps
    ) {
      this.renderer.powerUp(
        powerUp
      );
    }

    // 패들
    this.renderer.paddle(
      this.paddle
    );

    // 공
    for (
      const ball of this.balls
    ) {
      this.renderer.ball(
        ball
      );
    }

    // 파티클
    for (
      const particle of
      this.particles
    ) {
      this.renderer.particle(
        particle
      );
    }
  }

  // =========================
  // GAME LOOP
  // =========================

  loop(timestamp = 0) {
    this.update();
    this.draw();

    requestAnimationFrame(
      time =>
        this.loop(time)
    );
  }
}
