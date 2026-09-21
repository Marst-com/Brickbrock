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

function showError(error) {
  console.error(error);

  if (message) {
    message.textContent =
      "❌ 오류: " +
      (error?.message || error);
    message.style.color = "#ef4444";
  }

  alert(
    "게임 오류가 발생했습니다.\n\n" +
    (error?.message || error)
  );
}

try {
  if (!canvas) {
    throw new Error(
      "Canvas #game을 찾을 수 없습니다."
    );
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

  startButton?.addEventListener(
    "click",
    () => {
      try {
        console.log("START 버튼 클릭");

        game.start();

        console.log(
          "game.start() 실행 완료"
        );
      } catch (error) {
        showError(error);
      }
    }
  );

  pauseButton?.addEventListener(
    "click",
    () => {
      try {
        game.togglePause();
      } catch (error) {
        showError(error);
      }
    }
  );

  restartButton?.addEventListener(
    "click",
    () => {
      try {
        game.restart();
      } catch (error) {
        showError(error);
      }
    }
  );

  game.draw();

} catch (error) {
  showError(error);
}

window.addEventListener(
  "error",
  event => {
    showError(
      event.error ||
      new Error(event.message)
    );
  }
);

window.addEventListener(
  "unhandledrejection",
  event => {
    showError(
      event.reason ||
      new Error("알 수 없는 Promise 오류")
    );
  }
);
