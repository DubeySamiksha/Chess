import React, { useLayoutEffect, useState } from "react";
import { Chessboard, Square } from "react-chessboard";
import GameSession from "../../lib/session";
import { useInitialEffect } from "../../lib/utils";
import "./board.css";

function Board({ game }) {
  const [position, setPosition] = useState(game.getPosition());
  const [chessboardSize, setChessboardSize] = useState(undefined);

  // Observers
  useInitialEffect(() => {
    game.onBoardChange((position) => {
      console.log(game.timer);
      setPosition(position);
    });
  });

  // Chess resize
  useLayoutEffect(() => {
    function handleResize() {
      const display = document.getElementById("container");
      setChessboardSize(Math.min(720, display?.offsetWidth - 20));
    }

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  });

  // Functions
  const onDrop = (from, to) => {
    if (!game.isGameOver()) {
      return !!game.move({ from, to });
    }

    return false;
  };

  return (
    <div className="board" data-testid="board">
      <Chessboard
        animationDuration={200}
        boardOrientation="white"
        boardWidth={chessboardSize}
        position={position}
        onPieceDrop={onDrop}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
        }}
      />
    </div>
  );
}

export default Board;
