const express = require("express");
const https = require("https");
const socketIo = require("socket.io");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());

// Paths to SSL certificate and key
// Path to your .pfx file
const options = {
  key: fs.readFileSync("private.key"),
  cert: fs.readFileSync("certificate.crt"),
  ca: fs.readFileSync("ca_bundle.crt")
};
// Create an HTTPS server
const server = https.createServer(options, app);

// Initialize Socket.io with HTTPS
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

const PORT = 2087;
server.listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});
