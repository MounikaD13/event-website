const socketIo = require("socket.io");

const ADMIN_ROOM = "admins";
const USER_ROOM_PREFIX = "user:";

let io;

const getUserRoom = (userId) => `${USER_ROOM_PREFIX}${userId}`;

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

        socket.on("join_admin_room", () => {
            socket.join(ADMIN_ROOM);
            console.log(`Socket ${socket.id} joined admin room`);
        });

        socket.on("join_user_room", (userId) => {
            if (!userId) return;
            const room = getUserRoom(userId);
            socket.join(room);
            console.log(`Socket ${socket.id} joined room: ${room}`);
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

const emitToAdmins = (eventName, payload) => {
    getIo().to(ADMIN_ROOM).emit(eventName, payload);
};

const emitToUser = (userId, eventName, payload) => {
    if (!userId) return;
    getIo().to(getUserRoom(userId)).emit(eventName, payload);
};

module.exports = {
    ADMIN_ROOM,
    initSocket,
    getIo,
    emitToAdmins,
    emitToUser,
    getUserRoom
};