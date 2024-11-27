const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { Chess } = require("chess.js");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let games = {}; // Store ongoing games

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("createGame", () => {
    const gameId = Math.random().toString(36).substr(2, 9);
    games[gameId] = { chess: new Chess(), players: [socket.id] };
    socket.join(gameId);
    socket.emit("gameCreated", gameId);
    console.log(`Game created: ${gameId}`);
  });

  socket.on("joinGame", (gameId) => {
    if (games[gameId] && games[gameId].players.length === 1) {
      games[gameId].players.push(socket.id);
      socket.join(gameId);
      io.to(gameId).emit("startGame", { gameId });
      console.log(`User ${socket.id} joined game: ${gameId}`);
    } else {
      socket.emit("error", "Game full or not found.");
    }
  });

  socket.on("makeMove", ({ gameId, move }) => {
    const game = games[gameId]?.chess;
    if (game && game.move(move)) {
      io.to(gameId).emit("updateBoard", game.fen());
    } else {
      socket.emit("error", "Invalid move");
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    // Optionally cleanup game data here
  });
});

server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
