import { useEffect, useState } from "react";
import io from "socket.io-client";
import { Chessboard } from "react-chessboard";

const socket = io("http://localhost:4000");

const Game = () => {
  const [gameId, setGameId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fen, setFen] = useState("start");

  const createGame = () => {
    socket.emit("createGame");
  };

  const joinGame = (gameId) => {
    socket.emit("joinGame", gameId);
  };

  useEffect(() => {
    socket.on("gameCreated", (id) => {
      setGameId(id);
      setIsPlaying(true);
    });

    socket.on("startGame", () => {
      setIsPlaying(true);
    });

    return () => socket.off();
  }, []);

  useEffect(() => {
    socket.on("updateBoard", (newFen) => {
      setFen(newFen);
    });

    return () => socket.off("updateBoard");
  }, [socket]);

  const onDrop = (sourceSquare, targetSquare) => {
    const move = { from: sourceSquare, to: targetSquare, promotion: "q" };
    socket.emit("makeMove", { gameId, move });

    return true;
  };

  return (
    <div className="app">
      <h1>Multiplayer Chess</h1>
      {!isPlaying ? (
        <div>
          <button onClick={createGame}>Create Game</button>
          <input
            type="text"
            placeholder="Enter Game ID"
            onBlur={(e) => joinGame(e.target.value)}
          />
        </div>
      ) : (
        <div className="game">
          <h2>Game ID: {gameId}</h2>
          <Chessboard position={fen} onPieceDrop={onDrop} />
        </div>
      )}
    </div>
  );
};

export default Game;
