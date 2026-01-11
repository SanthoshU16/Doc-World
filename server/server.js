const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIo = require("socket.io");
const documentSocket = require("./socket");

const app = express();
const server = http.createServer(app);

/* ====================== MIDDLEWARE ====================== */
app.use(
  cors({
    origin: [
      "https://docworld-gamma.vercel.app",
      /\.vercel\.app$/,
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ====================== HEALTH CHECK ====================== */
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/* ====================== MONGODB ====================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

/* ====================== SOCKET.IO ====================== */
const io = socketIo(server, {
  cors: {
    origin: [
      "https://docworld-gamma.vercel.app",
      /\.vercel\.app$/,
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

documentSocket(io);

/* ====================== START SERVER ====================== */
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
