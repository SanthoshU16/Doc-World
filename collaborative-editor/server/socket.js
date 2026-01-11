const Document = require("./models/Document");

const userSocketMap = {};

function getAllConnectedClients(roomId, io) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

module.exports = (io) => {
    const defaultValue = "";

    io.on("connection", (socket) => {
        socket.on("join", async ({ roomId, username, isCreated }) => {
            const roomExists = io.sockets.adapter.rooms.has(roomId);
            console.log(`[JOIN] roomId: ${roomId}, username: ${username}, isCreated: ${isCreated}, roomExists: ${roomExists}`);

            if (isCreated) {
                // Proceed to join
            } else if (roomExists) {
                // Proceed to join (room is active)
            } else {
                // Room is not active, check DB
                const document = await Document.findById(roomId);
                if (!document) {
                    console.log(`[JOIN-ERROR] denying join for ${roomId} (not in DB)`);
                    socket.emit("join-error", "Room is invalid or not created yet.");
                    return;
                }
                // Document exists, proceed
            }

            userSocketMap[socket.id] = username;
            socket.join(roomId);
            const clients = getAllConnectedClients(roomId, io);
            clients.forEach(({ socketId }) => {
                io.to(socketId).emit("joined", {
                    clients,
                    username,
                    socketId: socket.id,
                });
            });
        });

        socket.on("get-document", async ({ roomId, isCreated }) => {
            console.log(`[GET-DOC] roomId: ${roomId}, isCreated: ${isCreated}`);

            try {
                // Always try to find or create the document
                // This allows users to join existing Spaces that haven't been saved yet
                const document = await findOrCreateDocument(roomId);
                console.log(`[GET-DOC] Document result:`, document ? 'Found/Created' : 'NULL');

                if (document) {
                    console.log(`[GET-DOC] Found/created document for ${roomId}, joining socket.`);
                    socket.join(roomId);
                    socket.emit("load-document", document.data);

                    socket.on("send-changes", (delta) => {
                        socket.broadcast.to(roomId).emit("receive-changes", delta);
                    });

                    socket.on("save-document", async (data) => {
                        await Document.findByIdAndUpdate(roomId, { data });
                    });
                } else {
                    console.error(`[GET-DOC] Document is null for ${roomId}`);
                    socket.emit("document-error", "Invalid Space ID");
                }
            } catch (error) {
                console.error(`[GET-DOC] Error:`, error);
                socket.emit("document-error", "Error loading document: " + error.message);
            }
        });

        socket.on("disconnecting", () => {
            const rooms = [...socket.rooms];
            rooms.forEach((roomId) => {
                socket.in(roomId).emit("disconnected", {
                    socketId: socket.id,
                    username: userSocketMap[socket.id],
                });
            });
            delete userSocketMap[socket.id];
            socket.leave();
        });
    });

    async function findOrCreateDocument(id) {
        console.log(`[findOrCreateDocument] Looking for document with id: ${id}`);
        if (id == null) {
            console.error(`[findOrCreateDocument] ID is null`);
            return;
        }

        const document = await Document.findById(id);
        if (document) {
            console.log(`[findOrCreateDocument] Found existing document`);
            return document;
        }

        console.log(`[findOrCreateDocument] Creating new document with id: ${id}`);
        const newDoc = await Document.create({ _id: id, data: defaultValue });
        console.log(`[findOrCreateDocument] Created new document:`, newDoc ? 'Success' : 'Failed');
        return newDoc;
    }
};

