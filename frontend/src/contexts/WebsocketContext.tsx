import { createContext } from "react";
import { io, Socket } from "socket.io-client";

export const socket = io("http://localhost:3001", { autoConnect: false }); // variable you want to share
export const WebsocketContext = createContext<Socket>(socket); // create a context for that variable
export const WebsocketProvider = WebsocketContext.Provider; // use this to make it clearner
