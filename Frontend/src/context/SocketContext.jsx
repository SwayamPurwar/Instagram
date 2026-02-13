import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import config from "../config";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  // Get user from storage to decide if we should connect
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (user && user.id) {
      // 1. Connect
      const newSocket = io(config.API_URL, { withCredentials: true });
      setSocket(newSocket);

      // 2. Cleanup on unmount or logout
      return () => newSocket.close();
    } else {
      // If no user, ensure socket is closed
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user?.id]); // Re-run connection logic if User ID changes

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};