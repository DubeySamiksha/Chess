import { Chess } from "chess.js";

const initialTimer = { white: 600, black: 600 };
const initialPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

class GameSession {
  chess;
  listeners;
  timer;
  history;
  timeout;
  currentIndex;
  isReset;

  constructor(loadFromStorage) {
    const storedSessionValue = localStorage.getItem("gameSession");
    const session =
      storedSessionValue && loadFromStorage
        ? JSON.parse(storedSessionValue)
        : undefined;

    this.chess = new Chess();
    this.chess.load(session ? session.position : initialPosition);

    this.timer = session ? session.timer : { ...initialTimer };

    this.history = session
      ? session.history
      : [
          {
            timer: { ...initialTimer },
            position: initialPosition,
          },
        ];

    this.currentIndex = session ? session.currentIndex : 0;

    this.listeners = { move: [], timer: [] };

    this.startTimer();
  }

  killTimer() {
    if (this.timeout) {
      clearInterval(this.timeout);
    }
  }

  startTimer() {
    this.timeout = setInterval(() => {
      if (this.isReset) {
        this.isReset = false;
        return;
      }

      if (!this.isGameOver() && !this.isFirstMove()) {
        this.setTimer({
          ...this.timer,
          [this.getOrientation()]: this.timer[this.getOrientation()] - 1,
        });
        this.save();
      }
    }, 1000);
  }

  getOrientation() {
    return this.chess.turn() === "w" ? "white" : "black";
  }

  move(move) {
    const moved = this.chess.move(move);

    if (!moved) {
      return null;
    }

    // Check if the board is not in the latest state of the history
    if (this.history.length !== this.currentIndex + 1) {
      const regression = this.history.length - (this.currentIndex + 1);
      this.history.splice(-regression);
    }

    this.history = [
      ...this.history,
      {
        timer: this.timer,
        position: this.getPosition(),
      },
    ];
    this.currentIndex++;

    this.trigger("move", this.getPosition());
    this.save();

    return moved;
  }

  reset() {
    this.killTimer();
    this.isReset = true;
    this.chess.reset();
    this.history = [
      {
        timer: { ...initialTimer },
        position: initialPosition,
      },
    ];
    this.trigger("move", initialPosition);
    this.setTimer(initialTimer);
    this.currentIndex = 0;
    this.save();
    this.startTimer();
  }

  undo() {
    const previousPosition = this.history[this.currentIndex - 1];
    const currentPosition = this.history[this.currentIndex];

    if (!previousPosition) {
      return;
    }

    this.chess.load(previousPosition.position);
    this.timer = currentPosition.timer;
    this.currentIndex--;
    this.trigger("move", previousPosition.position);
    this.save();
  }

  redo() {
    const nextPosition = this.history[this.currentIndex + 1];
    const currentPosition = this.history[this.currentIndex];

    if (!nextPosition) {
      return;
    }

    this.chess.load(nextPosition.position);
    this.timer = currentPosition.timer;
    this.currentIndex++;
    this.trigger("move", nextPosition.position);
    this.save();
  }

  setTimer(value) {
    this.timer = { ...value };
    this.trigger("timer", { ...this.timer });
  }

  getPosition() {
    return this.chess.fen();
  }

  save() {
    const game = {
      history: this.history,
      position: this.history[this.currentIndex].position,
      timer: this.timer,
      currentIndex: this.currentIndex,
    };

    localStorage.setItem("gameSession", JSON.stringify(game));
  }

  isGameOver() {
    return !this.timer.white || !this.timer.black || this.chess.game_over();
  }

  isFirstMove() {
    return this.history.length === 1;
  }

  getLoser() {
    return this.chess.in_checkmate() ||
      this.timer.black === 0 ||
      this.timer.white === 0
      ? this.chess.turn() !== "w"
        ? "white"
        : "black"
      : "draw";
  }

  // Event handlers
  onBoardChange(handler) {
    this.listeners.move.push(handler);
  }

  onTimerChange(handler) {
    this.listeners.timer.push(handler);
  }

  trigger(event, data) {
    this.listeners[event].forEach((listener) => listener(data));
  }
}

export default GameSession;
