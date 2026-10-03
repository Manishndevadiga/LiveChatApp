import jwt from "jsonwebtoken";
import { WebSocket } from "ws";
import Message from "../models/message.model.js";
import { User } from "../models/user.model.js";
import webpush from "../config/webPush.js";

export function setupChatSocket(wss) {

    wss.on("connection", (socket, request) => {

        try {

            // Get cookies from WebSocket handshake
            const cookieHeader = request?.headers?.cookie;

            if (!cookieHeader) {
                socket.close(1008, "Authentication required");
                return;
            }

            // Parse cookies
            const cookies = cookieHeader
                .split(";")
                .reduce((acc, cookie) => {
                    const [key, value] = cookie.trim().split("=");
                    acc[key] = value;
                    return acc;
                }, {});

            const accessToken = cookies?.accessToken;

            if (!accessToken) {
                socket.close(1008, "Authentication required");
                return;
            }

            // Verify JWT
            const decodedToken = jwt.verify(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET
            );

            // Store authenticated user ID on socket
            socket.userId = decodedToken?._id;

            console.log(
                "Authenticated user:",
                socket.userId
            );

        } catch (error) {

            console.log(
                "WebSocket authentication failed"
            );

            socket.close(
                1008,
                "Invalid authentication"
            );

            return;
        }

        // Message handler
        socket.on("message", async (message) => {

            try {

                const data = JSON.parse(
                    message.toString()
                );

                if (!data.text?.trim()) {
                    return;
                }

                // 1. Save message
                const newMessage = await Message.create({
                    sender: socket.userId,
                    text: data.text.trim()
                });

                // 2. Populate sender
                await newMessage.populate(
                    "sender",
                    "name email"
                );

                // 3. Broadcast message to connected users
                wss.clients.forEach((client) => {

                    if (client.readyState === WebSocket.OPEN) {

                        client.send(
                            JSON.stringify(newMessage)
                        );

                    }

                });

                // 4. Find all users who have
                //    a push subscription
                const users = await User.find({
                    pushSubscription: {
                        $exists: true,
                        $ne: null
                    }
                });

                console.log(
                    "Users with push subscription:",
                    users.length
                );

                // 5. Send push notification
                for (const user of users) {

                    if (!user.pushSubscription?.endpoint) {
                        continue;
                    }

                    try {

                        await webpush.sendNotification(
                            user.pushSubscription,
                            JSON.stringify({
                                title: `New message from ${newMessage.sender.name}`,
                                body: newMessage.text
                            })
                        );

                        console.log(
                            "Push notification sent to:",
                            user.email
                        );

                    } catch (error) {

                        console.error(
                            "Push notification failed for:",
                            user.email
                        );

                        console.error(
                            "Status:",
                            error.statusCode
                        );

                        console.error(
                            "Message:",
                            error.message
                        );

                    }

                }

            } catch (error) {

                console.error(
                    "Error processing message:",
                    error
                );

            }

        });

        // Socket closed
        socket.on("close", () => {

            console.log(
                "User disconnected:",
                socket.userId
            );

        });

    });

}