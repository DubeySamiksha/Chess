import React from "react";
import "./controls.css";

function Controls({ game }) {
  return (
    <div className="controls" data-testid="controls">
      <button
        onClick={() => {
          game.reset();
        }}
      >
        reset
      </button>
      <button
        onClick={() => {
          game.undo();
        }}
      >
        {"<"}
      </button>
      <button
        onClick={() => {
          game.redo();
        }}
      >
        {">"}
      </button>
    </div>
  );
}

export default Controls;
