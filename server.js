const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", socket => {
  console.log("A user connected");

  // Listen for joining a specific room (conversation)
  socket.on("joinRoom", conversationId => {
    socket.join(conversationId); // Multiple users can join the same room
    console.log(`User joined room: ${conversationId}`);
  });

  // Listen for sending a message in a room
  socket.on("sendMessage", data => {
    const { conversationId, message, senderId } = data;
    // Emit the message to everyone in the specific room

    io.to(conversationId).emit("receiveMessage", {
      conversationId: conversationId,
      message: message,
      senderId: senderId
    });

    console.log(
      `Message sent to room ${conversationId}: ${message} by ${senderId}`
    );
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
