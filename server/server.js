const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIo = require("socket.io");
const documentSocket = require("./socket");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const HTMLtoDOCX = require("html-to-docx");

// MongoDB Connection
mongoose
    .connect("mongodb://localhost:27017/collaborative-editor", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

// Socket.IO Setup
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

// Download Endpoint
app.post("/download", async (req, res) => {
    console.log(`[Download] Received request for: ${req.body.title}`);
    try {
        const { html, title } = req.body;
        if (!html) {
            console.error("[Download] Error: HTML content is missing");
            return res.status(400).send("HTML content is missing");
        }

        const sourceHTML = `<!DOCTYPE html><html><body>${html}</body></html>`;
        console.log("[Download] Starting conversion...");

        const fileBuffer = await HTMLtoDOCX(sourceHTML, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
        });

        console.log("[Download] Conversion successful, sending file.");
        const safeTitle = (title || "Document").replace(/\s+/g, '_');
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.docx"`);
        res.send(fileBuffer);
    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).send("Error generating document: " + error.message);
    }
});

documentSocket(io);

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
