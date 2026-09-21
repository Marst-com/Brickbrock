import { CONFIG } from "./config.js";
import { Game } from "./Game.js";

const canvas =
  document.querySelector("#game");

canvas.width =
  CONFIG.canvas.width;

canvas.height =
  CONFIG.canvas.height;

const ui = {
  score:
    document.querySelector("#score"),

  lives:
    document.querySelector("#lives"),

  level:
    document.querySelector("#level"),

  message(text) {
    document.querySelector("#message")
      .textContent = text;
  },

  update(score, lives, level) {
    this.score.textContent = score;
    this.lives.textContent = lives;
    this.level.textContent = level;
  }
};

const game =
  new Game(canvas, ui);

document
  .querySelector("#start")
  .addEventListener(
    "click",
    () => game.start()
  );

document
  .querySelector("#pause")
  .addEventListener(
    "click",
    () => game.togglePause()
  );

document
  .querySelector("#restart")
  .addEventListener(
    "click",
    () => game.restart()
  );

game.loop();
