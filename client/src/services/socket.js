import { io } from "socket.io-client";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "https://doc-world.onrender.com"; // fallback

export const initSocket = () => {
  return io(BACKEND_URL, {
    transports: ["websocket"],
    reconnectionAttempts: Infinity,
    timeout: 10000,
  });
};
