const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIo = require("socket.io");
const documentSocket = require("./socket");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check (IMPORTANT)
app.get("/health", (req, res) => res.send("OK"));

// MongoDB (PRODUCTION SAFE)
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch(console.error);

// Socket.IO
const io = socketIo(server, {
  cors: {
    origin: [
      "https://docworld-gamma.vercel.app",
      /\.vercel\.app$/,
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

documentSocket(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
