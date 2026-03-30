require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- Models ---
const Message = require("./models/Message");

// --- Track online users ---
const onlineUsers = new Map(); // socketId → { userId, username, room }

// --- REST: Get message history ---
app.get("/messages/:room", async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .sort({ createdAt: 1 })
      .limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Socket.IO ---
io.on("connection", (socket) => {
  console.log(`🔌 New connection: ${socket.id}`);

  // User joins a room
  socket.on("join_room", async ({ userId, username, room }) => {
    socket.join(room);
    onlineUsers.set(socket.id, { userId, username, room });

    // Notify others
    socket.to(room).emit("user_joined", { username, room });

    // Send updated online users list to everyone in room
    const usersInRoom = [...onlineUsers.values()].filter(
      (u) => u.room === room
    );
    io.to(room).emit("online_users", usersInRoom);

    // Send last 100 messages to this user
    try {
      const history = await Message.find({ room })
        .sort({ createdAt: 1 })
        .limit(100);
      socket.emit("message_history", history);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }

    console.log(`👤 ${username} joined room: ${room}`);
  });

  // Receive and broadcast a message
  socket.on("send_message", async (data) => {
    const { userId, username, room, text } = data;
    console.log(`✉️ Message from ${username} in ${room}: ${text}`);
    try {
      const message = await Message.create({ userId, username, room, text });
      console.log(`✅ Message saved to DB, broadcasting to ${room}`);
      io.to(room).emit("receive_message", message);
      socket.emit("receive_message", message); // extra safety for sender
    } catch (err) {
      console.error("❌ Failed to save message:", err);
    }
  });

  // Direct message (private)
  socket.on("send_dm", async (data) => {
    const { fromId, fromName, toId, text } = data;
    const room = `dm_${[fromId, toId].sort().join("_")}`;
    console.log(`🔒 DM from ${fromName} to ${toId}: ${text}`);
    try {
      const message = await Message.create({
        userId: fromId,
        username: fromName,
        room,
        text,
        isDM: true,
      });
      // Find the recipient socket
      const recipientSocket = [...onlineUsers.entries()].find(
        ([, u]) => u.userId === toId
      );
      if (recipientSocket) {
        console.log(`✅ Recipient online, sending to socket ${recipientSocket[0]}`);
        io.to(recipientSocket[0]).emit("receive_dm", message);
      } else {
        console.log(`⚠️ Recipient offline`);
      }
      socket.emit("receive_dm", message); // echo back to sender
    } catch (err) {
      console.error("❌ Failed to save DM:", err);
    }
  });

  // Typing indicator
  socket.on("typing", ({ username, room }) => {
    socket.to(room).emit("user_typing", { username });
  });

  socket.on("stop_typing", ({ username, room }) => {
    socket.to(room).emit("user_stop_typing", { username });
  });

  // Disconnect
  socket.on("disconnect", () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      const { username, room } = user;
      onlineUsers.delete(socket.id);
      socket.to(room).emit("user_left", { username });

      const usersInRoom = [...onlineUsers.values()].filter(
        (u) => u.room === room
      );
      io.to(room).emit("online_users", usersInRoom);
      console.log(`👋 ${username} disconnected`);
    }
  });
});

// --- Health check ---
app.get("/", (req, res) => res.send("Akabando Chat Server is running ✅"));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Chat server running on http://localhost:${PORT}`);
});
