import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const server = createServer();
const app = express();
const port = 3000;

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});
const io = new Server(server);
io.on("connection", (socket) => {
  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
