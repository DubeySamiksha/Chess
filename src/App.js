import { useEffect, useState } from "react";
import Board from "./components/board";
import Controls from "./components/controls";
import GameSession from "./lib/session";
import "./components/board/board.css";
import Header from "./components/header";
import "./App.css";

function App() {
  const [game, setGame] = useState();

  useEffect(() => {
    setGame(new GameSession(true));
  }, []);

  return game ? (
    <div className="chess" id="container">
      <Header game={game} />
      <Board game={game} />
      <Controls game={game} />
    </div>
  ) : null;
}

export default App;
