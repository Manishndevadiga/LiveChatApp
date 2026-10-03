import dotenv from "dotenv";
import "dotenv/config";
import http from "http";
import { WebSocketServer } from "ws";

import { app } from "./app.js";
import connectDB from "./database/db.js";
import { setupChatSocket } from "./sockets/chat.socket.js";

dotenv.config({ path: ".env" });

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const wss = new WebSocketServer({
    server,
});

setupChatSocket(wss);

const startServer = async () => {
    try {
        // 1. Connect to MongoDB
        await connectDB();

        // 2. Start HTTP + WebSocket server
        // server.listen(PORT, () => {
        //     console.log(`Server is running at port : ${PORT}`);
        // });

        server.listen(PORT, "0.0.0.0", () => {
            console.log(`Server is running at port : ${PORT}`);
        });

    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

startServer();

