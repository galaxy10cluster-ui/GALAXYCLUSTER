// src/sockets/debateSocket.js
//
// Clients join a room with socket.emit("join_room", roomId) when they open
// a debate page. The debateController emits to `room:${roomId}` whenever a
// comment is posted, voted on, deleted, or pinned, so every connected
// browser sees updates live without polling.

function attachDebateSocket(io) {
  io.on("connection", (socket) => {
    socket.on("join_room", (roomId) => {
      if (typeof roomId !== "string") return;
      socket.join(`room:${roomId}`);
    });

    socket.on("leave_room", (roomId) => {
      if (typeof roomId !== "string") return;
      socket.leave(`room:${roomId}`);
    });

    socket.on("typing", ({ roomId, displayName }) => {
      if (!roomId || !displayName) return;
      socket.to(`room:${roomId}`).emit("user_typing", { displayName });
    });

    socket.on("disconnect", () => {
      // no-op — room membership is cleaned up automatically by Socket.io
    });
  });
}

module.exports = { attachDebateSocket };
