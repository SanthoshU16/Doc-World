const Document = require("./models/Document");

const userSocketMap = {};

function getAllConnectedClients(roomId, io) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => ({
      socketId,
      username: userSocketMap[socketId],
    })
  );
}

module.exports = (io) => {
  const defaultValue = "";

  io.on("connection", (socket) => {
    let currentRoomId = null;

    /* JOIN ROOM */
    socket.on("join", async ({ roomId, username }) => {
      try {
        if (!roomId || !username) {
          socket.emit("join-error", "Invalid room or username");
          return;
        }

        const document = await findOrCreateDocument(roomId);
        if (!document) {
          socket.emit("join-error", "Invalid Space ID");
          return;
        }

        userSocketMap[socket.id] = username;
        currentRoomId = roomId;

        socket.join(roomId);

        const clients = getAllConnectedClients(roomId, io);
        clients.forEach(({ socketId }) => {
          io.to(socketId).emit("joined", {
            clients,
            username,
            socketId: socket.id,
          });
        });
      } catch (err) {
        console.error("[JOIN ERROR]", err);
        socket.emit("join-error", "Server error while joining");
      }
    });

    /* LOAD DOCUMENT */
    socket.on("get-document", async ({ roomId }) => {
      try {
        if (!roomId) return;

        const document = await findOrCreateDocument(roomId);
        if (!document) {
          socket.emit("document-error", "Invalid Space ID");
          return;
        }

        socket.emit("load-document", document.data);
      } catch (err) {
        console.error("[GET DOCUMENT ERROR]", err);
        socket.emit("document-error", "Failed to load document");
      }
    });

    /* REALTIME SYNC */
    socket.on("send-changes", (delta) => {
      if (!currentRoomId) return;
      socket.broadcast.to(currentRoomId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      if (!currentRoomId) return;
      await Document.findByIdAndUpdate(currentRoomId, { data });
    });

    /* DISCONNECT */
    socket.on("disconnect", () => {
      if (currentRoomId) {
        socket.to(currentRoomId).emit("disconnected", {
          socketId: socket.id,
          username: userSocketMap[socket.id],
        });
      }
      delete userSocketMap[socket.id];
    });
  });

  async function findOrCreateDocument(id) {
    if (!id) return null;

    const document = await Document.findById(id);
    if (document) return document;

    return await Document.create({
      _id: id,
      data: defaultValue,
    });
  }
};
