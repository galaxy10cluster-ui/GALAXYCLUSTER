"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

let sharedSocket: Socket | null = null;

function getSocket(): Socket {
  if (!sharedSocket) {
    sharedSocket = io(SOCKET_URL, { autoConnect: true, transports: ["websocket", "polling"] });
  }
  return sharedSocket;
}

export function useDebateSocket(roomId: string | undefined) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const socket = getSocket();
    socketRef.current = socket;

    socket.emit("join_room", roomId);
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    if (socket.connected) setConnected(true);

    return () => {
      socket.emit("leave_room", roomId);
    };
  }, [roomId]);

  return { socket: socketRef.current, connected };
}
