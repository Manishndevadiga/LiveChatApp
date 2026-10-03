import toast, { Toaster } from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import FeedbackIcon from "@mui/icons-material/Feedback";
import FeedbackForm from "./Feedback";

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";

import "../App.css";
import "../styles/chatui.css";
import callApi from "../common/scripts";

function Chat({ user, setUser }) {

    const navigate = useNavigate();

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [feedbackOpen, setFeedbackOpen] = useState(false);

    const socketRef = useRef(null);
    const chatContainerRef = useRef(null);


    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    // 1. Load existing messages from the database
    // 1. Load existing messages from the database
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const data = await callApi("/messages/getMessages", "GET");

                console.log("Messages response:", data?.data);

                if (data?.success) {
                    setMessages(data?.data);
                } else {
                    console.error(data?.message || "Failed to load messages");
                }
            } catch (error) {
                console.error("Error loading messages:", error);
            }
        };

        loadMessages();
    }, []);

    // 2. Connect to WebSocket for NEW messages
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:4000");

        socketRef.current = ws;

        ws.onopen = () => {
            console.log("Connected to WebSocket server");
            toast.success("WebSocket connected", { duration: 2000, position: "top-center" });
        };

        // Exactly. Your understanding is correct. Your current backend explicitly broadcasts the message
        //  back to all connected clients, including the sender.

        ws.onmessage = (event) => {
            const newMessage = JSON.parse(event.data);

            const messageWithOwnership = {
                ...newMessage,
                isMine: newMessage.sender._id === user._id,
            };

            setMessages((previousMessages) => {
                if (!Array.isArray(previousMessages)) {
                    console.error(
                        "previousMessages is not an array:",
                        previousMessages
                    );

                    return [messageWithOwnership];
                }

                return [
                    ...previousMessages,
                    messageWithOwnership,
                ];
            });
        };

        ws.onclose = () => {
            console.log("Disconnected from WebSocket server");
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => {
            ws.close();
        };
    }, []);


    const urlBase64ToUint8Array = (base64String) => {
        const padding = "=".repeat(
            (4 - (base64String.length % 4)) % 4
        );

        const base64 = (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const rawData = window.atob(base64);

        return Uint8Array.from(
            [...rawData].map((char) => char.charCodeAt(0))
        );
    };


    const subscribeToPush = async () => {
        try {
            // 1. Get the registered Service Worker
            const registration =
                await navigator.serviceWorker.ready;

            // 2. Get VAPID public key
            const vapidPublicKey =
                import.meta.env.VITE_VAPID_PUBLIC_KEY;

            // 3. Convert VAPID key
            const convertedVapidKey =
                urlBase64ToUint8Array(vapidPublicKey);

            // 4. Create Push Subscription
            const subscription =
                await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });

            console.log(
                "Push subscription:",
                subscription
            );

            // 5. Send subscription to backend
            const response = await callApi(
                "/user/subscribe",
                "POST",
                subscription
            );

            console.log(
                "Subscription server response:",
                response
            );

        } catch (error) {
            console.error(
                "Push subscription failed:",
                error
            );
        }
    };

    const handleEnableNotifications = async () => {
        await subscribeToPush();
    };

    // 3. Send a new message
    const sendMessage = () => {
        if (message.trim() === "") {
            return;
        }

        const messageData = {
            text: message.trim(),
        };

        if (
            socketRef?.current &&
            socketRef.current.readyState === WebSocket.OPEN
        ) {
            socketRef.current.send(JSON.stringify(messageData));
            setMessage("");
        } else {
            console.log("WebSocket is not connected");
            toast.error("WebSocket is not connected", {
                duration: 3000,
                position: "top-center",
            });
        }
    };


    const handleLogoutClick = () => {
        setLogoutDialogOpen(true);
    };

    const handleLogoutCancel = () => {
        setLogoutDialogOpen(false);
    };

    const handleLogoutConfirm = async () => {
        const data = await callApi("/user/logout", "POST");

        if (data?.success) {
            setLogoutDialogOpen(false);
            setUser(null);
            navigate("/login");

            toast.success("Logged out successfully", {
                duration: 3000,
                position: "top-center",
            });
        } else {
            toast.error(data?.message || "Logout failed");
        }
    };

    const handleFeedbackClick = () => {
        setFeedbackOpen(true);
    };


    return (
        <>
            <Toaster />

            <div className="mainConatiner">

                <div className="headerOfChat">
                    <div className="headerButtons">

                        <button
                            className="feedbackButton"
                            onClick={handleFeedbackClick}
                            title="Feedback"
                            aria-label="Open feedback"
                        >
                            <FeedbackIcon />
                        </button>

                        <button
                            className="enableNotificationsButton"
                            onClick={handleEnableNotifications}
                        >
                            Enable Notifications
                        </button>

                        <button
                            className="logoutButton"
                            onClick={handleLogoutClick}
                        >
                            Logout
                        </button>

                    </div>
                </div>


                <div className="chatContainer" ref={chatContainerRef}>

                    {messages?.map((message, index) => (
                        <div
                            key={index}
                            className={`message ${message?.isMine === true
                                ? "myMessage"
                                : "otherMessage"
                                }`}
                        >
                            {message?.text}
                        </div>
                    ))}

                </div>

                <div className="messageInputContainer">

                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                sendMessage();
                            }
                        }}
                    />

                    <button onClick={sendMessage}>
                        Send
                    </button>

                </div>


                <Dialog
                    open={logoutDialogOpen}
                    onClose={handleLogoutCancel}
                >
                    <DialogTitle sx={{ color: "#333333" }}>
                        Logout
                    </DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to logout?
                        </DialogContentText>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleLogoutCancel}>
                            Cancel
                        </Button>

                        <Button
                            onClick={handleLogoutConfirm}
                            color="error"
                            variant="contained"
                        >
                            Logout
                        </Button>
                    </DialogActions>
                </Dialog>

                <FeedbackForm
                    open={feedbackOpen}
                    onClose={() => setFeedbackOpen(false)}
                />

            </div>
        </>
    );
}

export default Chat;
