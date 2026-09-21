import { CONFIG } from "./config.js";
import { Game } from "./Game.js";

const canvas = document.getElementById("game");

const score = document.getElementById("score");
const lives = document.getElementById("lives");
const level = document.getElementById("level");

const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const restartButton = document.getElementById("restart");

const message = document.getElementById("message");

if (!canvas) {
  throw new Error("Canvas #game을 찾을 수 없습니다.");
}

canvas.width = CONFIG.canvas.width;
canvas.height = CONFIG.canvas.height;

const ui = {
  score,
  lives,
  level,
  message
};

const game = new Game(canvas, ui);

// 시작
startButton?.addEventListener("click", () => {
  game.start();
});

// 일시정지
pauseButton?.addEventListener("click", () => {
  game.togglePause();
});

// 재시작
restartButton?.addEventListener("click", () => {
  game.restart();
});

// 초기 화면
game.draw();
