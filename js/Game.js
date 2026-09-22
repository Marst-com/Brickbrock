import { CONFIG } from "./config.js";

import { Ball } from "./Ball.js";
import { Paddle } from "./Paddle.js";
import { Brick } from "./Brick.js";
import { PowerUp } from "./PowerUp.js";
import { Particle } from "./Particle.js";

import { Renderer } from "./Renderer.js";
import { Input } from "./Input.js";
import { AudioManager } from "./Audio.js";
import { CanvasManager } from "./Canvas.js";


export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;

    this.canvasManager =
      new CanvasManager(
        canvas,
        CONFIG.canvas.width,
        CONFIG.canvas.height
      );

    this.ctx =
      this.canvasManager.ctx;

    this.ui = ui;

    this.renderer =
      new Renderer(this.ctx);

    this.input =
      new Input(canvas);

    this.audio =
      new AudioManager();


    // -------------------------
    // 게임 오브젝트
    // -------------------------

    this.paddle =
      new Paddle(
        CONFIG.canvas.width,
        CONFIG.paddle.width,
        CONFIG.paddle.height,
        CONFIG.paddle.speed
      );

    this.balls = [];

    this.bricks = [];

    this.powerUps = [];

    this.particles = [];


    // -------------------------
    // 게임 상태
    // -------------------------

    this.score = 0;

    this.lives =
      CONFIG.lives;

    this.level = 1;

    this.running = false;

    this.paused = false;

    this.respawning = false;

    this.respawnTime = 0;


    // -------------------------
    // 초기화
    // -------------------------

    this.createLevel();

    this.resetBalls();

    this.updateUI();
  }


  // =========================================================
  // LEVEL
  // =========================================================

  createLevel() {
    this.bricks = [];

    const rows =
      CONFIG.brick.rows;

    const cols =
      CONFIG.brick.cols;

    const width =
      CONFIG.brick.width;

    const height =
      CONFIG.brick.height;

    const gap =
      CONFIG.brick.gap;

    const top =
      CONFIG.brick.top;


    const totalWidth =
      cols * width +
      (cols - 1) * gap;

    const startX =
      (CONFIG.canvas.width -
        totalWidth) / 2;


    for (let row = 0; row < rows; row++) {

      for (
        let col = 0;
        col < cols;
        col++
      ) {

        // --------------------------------
        // 스테이지별 패턴
        // --------------------------------

        let exists = true;


        // Stage 2
        if (this.level === 2) {
          exists =
            row === 0 ||
            row === 5 ||
            col === 0 ||
            col === 9 ||
            row === 2 ||
            row === 3;
        }


        // Stage 3
        if (this.level === 3) {
          exists =
            (
              row >= 1 &&
              row <= 4 &&
              col >= 2 &&
              col <= 7
            );

          if (
            row === 2 ||
            row === 3
          ) {
            exists =
              col >= 1 &&
              col <= 8;
          }
        }


        // Stage 4
        if (this.level === 4) {
          exists =
            Math.abs(
              col - 4.5
            ) <= row + 1;
        }


        // Stage 5+
        if (this.level >= 5) {
          exists =
            (row + col) % 2 === 0;

          if (
            row === 0 ||
            row === rows - 1
          ) {
            exists = true;
          }
        }


        if (!exists) {
          continue;
        }


        // --------------------------------
        // HP
        // --------------------------------

        const hp =
          Math.min(
            1 +
            Math.floor(
              (
                row +
                this.level -
                1
              ) / 2
            ),
            3
          );


        // --------------------------------
        // 폭탄 벽돌
        // --------------------------------

        let type = "normal";

        const bombChance =
          Math.min(
            0.08 +
            this.level * 0.01,
            0.16
          );


        if (
          row >= 1 &&
          Math.random() <
            bombChance
        ) {
          type = "bomb";
        }


        this.bricks.push(
          new Brick(
            startX +
              col *
              (width + gap),

            top +
              row *
              (height + gap),

            width,
            height,

            type,
            type === "bomb"
              ? 1
              : hp
          )
        );
      }
    }
  }


  // =========================================================
  // BALL
  // =========================================================

  resetBalls() {
    this.balls = [];

    const speed =
      CONFIG.ball.speed +
      Math.min(
        this.level - 1,
        8
      ) * 0.35;


    this.balls.push(
      new Ball(
        CONFIG.canvas.width / 2,
        430,
        CONFIG.ball.radius,
        speed
      )
    );
  }


  // =========================================================
  // START
  // =========================================================

  start() {
    if (this.running) {
      return;
    }


    // 모바일 브라우저 오디오
    // 권한 문제를 막기 위해 안전하게 실행
    try {
      this.audio.init();
    } catch (error) {
      console.warn(
        "Audio 초기화 실패:",
        error
      );
    }


    this.running = true;

    this.paused = false;

    this.respawning = false;


    this.setMessage(
      "게임 시작!"
    );


    requestAnimationFrame(
      time => this.loop(time)
    );
  }


  // =========================================================
  // PAUSE
  // =========================================================

  togglePause() {
    if (!this.running) {
      return;
    }

    if (this.respawning) {
      return;
    }


    this.paused =
      !this.paused;


    this.setMessage(
      this.paused
        ? "⏸ 일시정지"
        : "▶ 게임 진행"
    );


    if (!this.paused) {
      requestAnimationFrame(
        time => this.loop(time)
      );
    }
  }


  // =========================================================
  // RESTART
  // =========================================================

  restart() {
    this.score = 0;

    this.lives =
      CONFIG.lives;

    this.level = 1;

    this.running = false;

    this.paused = false;

    this.respawning = false;

    this.respawnTime = 0;


    this.powerUps = [];

    this.particles = [];


    this.paddle.reset();

    this.createLevel();

    this.resetBalls();

    this.updateUI();

    this.setMessage(
      "다시 시작할 준비 완료!"
    );


    this.draw();
  }


  // =========================================================
  // UPDATE
  // =========================================================

  update() {
    if (
      !this.running ||
      this.paused
    ) {
      return;
    }


    // -------------------------
    // 부활 카운트다운
    // -------------------------

    if (this.respawning) {
      this.updateRespawn();

      this.updateParticles();

      return;
    }


    // -------------------------
    // 패들
    // -------------------------

    this.updatePaddle();


    // -------------------------
    // 공
    // -------------------------

    this.updateBalls();


    // -------------------------
    // 파워업
    // -------------------------

    this.updatePowerUps();


    // -------------------------
    // 파티클
    // -------------------------

    this.updateParticles();


    // -------------------------
    // 스테이지 클리어
    // -------------------------

    this.checkLevelClear();


    this.updateUI();
  }


  // =========================================================
  // PADDLE
  // =========================================================

  updatePaddle() {

    if (this.input.left) {
      this.paddle.move(-1);
    }

    if (this.input.right) {
      this.paddle.move(1);
    }


    if (
      this.input.pointerActive
    ) {
      this.paddle.moveTo(
        this.input.pointerX
      );
    }
  }


  // =========================================================
  // BALLS
  // =========================================================

  updateBalls() {

    for (
      let i = this.balls.length - 1;
      i >= 0;
      i--
    ) {

      const ball =
        this.balls[i];


      ball.update();


      // -------------------------
      // 좌우 벽
      // -------------------------

      if (
        ball.x -
          ball.radius <= 0
      ) {

        ball.x =
          ball.radius;

        ball.bounceX();

        this.audio.wall();
      }


      if (
        ball.x +
          ball.radius >=
        CONFIG.canvas.width
      ) {

        ball.x =
          CONFIG.canvas.width -
          ball.radius;

        ball.bounceX();

        this.audio.wall();
      }


      // -------------------------
      // 위쪽 벽
      // -------------------------

      if (
        ball.y -
          ball.radius <= 0
      ) {

        ball.y =
          ball.radius;

        ball.bounceY();

        this.audio.wall();
      }


      // -------------------------
      // 패들
      // -------------------------

      if (
        this.collidesWithPaddle(
          ball
        )
      ) {

        this.handlePaddleHit(
          ball
        );
      }


      // -------------------------
      // 벽돌
      // -------------------------

      this.checkBrickCollision(
        ball
      );


      // -------------------------
      // 바닥
      // -------------------------

      if (
        ball.y -
          ball.radius >
        CONFIG.canvas.height
      ) {

        ball.alive = false;

        this.balls.splice(
          i,
          1
        );
      }
    }


    // 모든 공을 잃음
    if (
      this.balls.length === 0 &&
      !this.respawning
    ) {
      this.loseLife();
    }
  }


  // =========================================================
  // PADDLE COLLISION
  // =========================================================

  collidesWithPaddle(ball) {

    return (
      ball.dy > 0 &&

      ball.x + ball.radius >=
        this.paddle.x &&

      ball.x - ball.radius <=
        this.paddle.x +
        this.paddle.width &&

      ball.y + ball.radius >=
        this.paddle.y &&

      ball.y - ball.radius <=
        this.paddle.y +
        this.paddle.height
    );
  }


  handlePaddleHit(ball) {

    ball.y =
      this.paddle.y -
      ball.radius;


    // 패들 중심에서 얼마나 떨어졌는지
    const hitPosition =
      (
        ball.x -
        (
          this.paddle.x +
          this.paddle.width / 2
        )
      ) /
      (
        this.paddle.width / 2
      );


    const maxAngle =
      Math.PI / 3;


    const angle =
      hitPosition *
      maxAngle;


    const speed =
      Math.max(
        ball.speed,
        CONFIG.ball.speed
      );


    ball.dx =
      Math.sin(angle) *
      speed;

    ball.dy =
      -Math.cos(angle) *
      speed;


    this.audio.paddle();

    this.canvasManager.shake(1);
  }


  // =========================================================
  // BRICK COLLISION
  // =========================================================

  checkBrickCollision(ball) {

    for (
      const brick of this.bricks
    ) {

      if (brick.destroyed) {
        continue;
      }


      if (
        !this.collidesWithBrick(
          ball,
          brick
        )
      ) {
        continue;
      }


      // -------------------------
      // 공 방향 반전
      // -------------------------

      const centerX =
        brick.x +
        brick.width / 2;

      const centerY =
        brick.y +
        brick.height / 2;


      const dx =
        ball.x - centerX;

      const dy =
        ball.y - centerY;


      if (
        Math.abs(dx) >
        Math.abs(dy)
      ) {
        ball.bounceX();
      } else {
        ball.bounceY();
      }


      // -------------------------
      // 벽돌 데미지
      // -------------------------

      const destroyed =
        brick.hit();


      if (destroyed) {

        this.destroyBrick(
          brick
        );

      } else {

        this.score += 10;

        this.audio.brick();

        this.spawnParticles(
          brick.x +
            brick.width / 2,
          brick.y +
            brick.height / 2,
          brick.getColor(),
          4
        );
      }


      // 한 번의 프레임에서
      // 같은 공이 여러 벽돌을 뚫는 것 방지
      break;
    }
  }


  collidesWithBrick(
    ball,
    brick
  ) {

    return (
      ball.x +
        ball.radius >=
        brick.x &&

      ball.x -
        ball.radius <=
        brick.x +
        brick.width &&

      ball.y +
        ball.radius >=
        brick.y &&

      ball.y -
        ball.radius <=
        brick.y +
        brick.height
    );
  }


  // =========================================================
  // DESTROY BRICK
  // =========================================================

  destroyBrick(brick) {

    brick.destroyed = true;


    this.score +=
      brick.type === "bomb"
        ? 150
        : 50;


    // -------------------------
    // 일반 파괴 효과
    // -------------------------

    this.spawnParticles(
      brick.x +
        brick.width / 2,
      brick.y +
        brick.height / 2,
      brick.getColor(),
      brick.type === "bomb"
        ? 24
        : 10
    );


    // -------------------------
    // 폭탄
    // -------------------------

    if (
      brick.type === "bomb"
    ) {

      this.audio.bomb();

      this.canvasManager.shake(
        10
      );

      this.canvasManager.flash(
        0.12
      );


      this.explodeBrick(
        brick
      );

      return;
    }


    // -------------------------
    // 일반 벽돌
    // -------------------------

    this.audio.brickBreak();


    this.canvasManager.shake(
      2
    );


    // -------------------------
    // 파워업
    // -------------------------

    if (
      Math.random() <
      CONFIG.brick.dropRate
    ) {

      this.spawnPowerUp(
        brick.x +
          brick.width / 2,

        brick.y +
          brick.height / 2
      );
    }
  }


  // =========================================================
  // BOMB
  // =========================================================

  explodeBrick(source) {

    const radius = 90;


    for (
      const brick of this.bricks
    ) {

      if (
        brick.destroyed ||
        brick === source
      ) {
        continue;
      }


      const dx =
        brick.x +
        brick.width / 2 -
        (
          source.x +
          source.width / 2
        );


      const dy =
        brick.y +
        brick.height / 2 -
        (
          source.y +
          source.height / 2
        );


      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );


      if (
        distance <= radius
      ) {

        brick.destroyed = true;

        this.score += 50;


        this.spawnParticles(
          brick.x +
            brick.width / 2,
          brick.y +
            brick.height / 2,
          brick.getColor(),
          8
        );
      }
    }
  }


  // =========================================================
  // POWER UPS
  // =========================================================

  spawnPowerUp(x, y) {

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
        x,
        y,
        type
      )
    );
  }


  updatePowerUps() {

    for (
      let i =
        this.powerUps.length - 1;

      i >= 0;

      i--
    ) {

      const powerUp =
        this.powerUps[i];


      powerUp.update();


      // -------------------------
      // 패들과 충돌
      // -------------------------

      if (
        this.collidesWithPowerUp(
          powerUp
        )
      ) {

        this.applyPowerUp(
          powerUp.type
        );


        powerUp.active =
          false;
      }


      if (
        !powerUp.active
      ) {

        this.powerUps.splice(
          i,
          1
        );
      }
    }
  }


  collidesWithPowerUp(
    powerUp
  ) {

    return (
      powerUp.x +
        powerUp.size / 2 >=
        this.paddle.x &&

      powerUp.x -
        powerUp.size / 2 <=
        this.paddle.x +
        this.paddle.width &&

      powerUp.y +
        powerUp.size / 2 >=
        this.paddle.y &&

      powerUp.y -
        powerUp.size / 2 <=
        this.paddle.y +
        this.paddle.height
    );
  }


  applyPowerUp(type) {

    this.audio.powerUp();


    switch (type) {

      case "duplicate":
        this.duplicateBalls();
        this.audio.duplicate();
        break;


      case "expand":
        this.paddle.expand();
        this.audio.expand();
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
          ball.setSpeed(0.65);
        }

        this.audio.slow();
        break;


      case "life":

        this.lives++;

        this.audio.life();

        break;
    }


    this.canvasManager.flash(
      0.05
    );
  }


  duplicateBalls() {

    const originals = [
      ...this.balls
    ];


    for (
      const original of originals
    ) {

      if (
        this.balls.length >= 6
      ) {
        break;
      }


      const ball =
        new Ball(
          original.x,
          original.y,
          original.radius,
          original.speed
        );


      ball.dx =
        -original.dx;

      ball.dy =
        original.dy;


      ball.piercing =
        original.piercing;


      this.balls.push(ball);
    }
  }


  // =========================================================
  // PARTICLES
  // =========================================================

  spawnParticles(
    x,
    y,
    color,
    count
  ) {

    for (
      let i = 0;
      i < count;
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
      let i =
        this.particles.length - 1;

      i >= 0;

      i--
    ) {

      const particle =
        this.particles[i];


      particle.update();


      if (
        particle.life <= 0
      ) {

        this.particles.splice(
          i,
          1
        );
      }
    }
  }


  // =========================================================
  // LIFE
  // =========================================================

  loseLife() {

    this.lives--;

    this.audio.loseLife();

    this.canvasManager.shake(
      7
    );

    this.canvasManager.flash(
      0.08
    );


    if (
      this.lives <= 0
    ) {

      this.gameOver();

      return;
    }


    // -------------------------
    // 3초 부활
    // -------------------------

    this.respawning = true;

    this.respawnTime =
      CONFIG.respawn.countdown;


    this.balls = [];

    this.paddle.reset();


    this.setMessage(
      "💔 부활까지 3초..."
    );


    this.updateUI();
  }


  updateRespawn() {

    this.respawnTime -=
      1 / 60;


    const seconds =
      Math.max(
        0,
        Math.ceil(
          this.respawnTime
        )
      );


    this.setMessage(
      `💔 부활까지 ${seconds}초...`
    );


    if (
      this.respawnTime <= 0
    ) {

      this.respawning = false;

      this.paddle.reset();

      this.resetBalls();

      this.setMessage(
        "🔥 부활!"
      );
    }
  }


  // =========================================================
  // GAME OVER
  // =========================================================

  gameOver() {

    this.running = false;

    this.paused = false;

    this.respawning = false;


    this.audio.gameOver();


    this.canvasManager.shake(
      10
    );

    this.canvasManager.flash(
      0.15
    );


    this.setMessage(
      `GAME OVER · 점수 ${this.score}`
    );


    this.updateUI();

    this.draw();
  }


  // =========================================================
  // LEVEL CLEAR
  // =========================================================

  checkLevelClear() {

    const remaining =
      this.bricks.some(
        brick =>
          !brick.destroyed
      );


    if (remaining) {
      return;
    }


    this.level++;


    this.audio.levelUp();


    this.canvasManager.flash(
      0.1
    );


    this.canvasManager.shake(
      5
    );


    this.powerUps = [];

    this.particles = [];


    this.createLevel();

    this.resetBalls();

    this.paddle.reset();


    this.setMessage(
      `STAGE ${this.level}`
    );


    this.updateUI();
  }


  // =========================================================
  // UI
  // =========================================================

  updateUI() {

    if (this.ui.score) {
      this.ui.score.textContent =
        this.score;
    }


    if (this.ui.lives) {
      this.ui.lives.textContent =
        this.lives;
    }


    if (this.ui.level) {
      this.ui.level.textContent =
        this.level;
    }
  }


  setMessage(text) {

    if (this.ui.message) {
      this.ui.message.textContent =
        text;
    }
  }


  // =========================================================
  // DRAW
  // =========================================================

  draw() {

    this.canvasManager.clear();

    this.canvasManager.beginFrame();


    this.renderer.background(
      CONFIG.canvas.width,
      CONFIG.canvas.height
    );


    // -------------------------
    // 벽돌
    // -------------------------

    for (
      const brick of this.bricks
    ) {

      if (
        !brick.destroyed
      ) {

        this.renderer.brick(
          brick
        );
      }
    }


    // -------------------------
    // 파워업
    // -------------------------

    for (
      const powerUp of this.powerUps
    ) {

      this.renderer.powerUp(
        powerUp
      );
    }


    // -------------------------
    // 패들
    // -------------------------

    this.renderer.paddle(
      this.paddle
    );


    // -------------------------
    // 공
    // -------------------------

    for (
      const ball of this.balls
    ) {

      this.renderer.ball(
        ball
      );
    }


    // -------------------------
    // 파티클
    // -------------------------

    for (
      const particle of this.particles
    ) {

      this.renderer.particle(
        particle
      );
    }


    // -------------------------
    // 부활 화면
    // -------------------------

    if (
      this.respawning
    ) {

      this.renderer.countdown(
        Math.ceil(
          this.respawnTime
        )
      );
    }


    this.canvasManager.endFrame();
  }


  // =========================================================
  // GAME LOOP
  // =========================================================

  loop(timestamp = 0) {

    if (!this.running) {

      this.draw();

      return;
    }


    this.update();

    this.draw();


    requestAnimationFrame(
      time =>
        this.loop(time)
    );
  }
}
