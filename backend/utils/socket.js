const socketIo = require("socket.io");

let io;

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        // Join a private room based on userId
        socket.on("join_room", (userId) => {
            socket.join(userId);
            console.log(`User ${socket.id} joined room: ${userId}`);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIo };
