import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Message from "../models/message.model.js";
import jwt from "jsonwebtoken";

const loadMessages = asyncHandler(async (req, res) => {
    // 1. Get access token from cookie
    const token = req.cookies?.accessToken;

    if (!token) {
        throw new ApiError(401, "Unauthorized");
    }

    // 2. Verify JWT
    const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
    );

    // 3. Get logged-in user's ID from token
    const loggedInUserId = decodedToken._id;

    if (!loggedInUserId) {
        throw new ApiError(401, "Invalid access token");
    }

    // 4. Get all messages from database
    const messages = await Message.find()
        .populate("sender", "name email")
        .sort({ createdAt: 1 });

    // 5. Add isMine for frontend
    const messagesWithOwnership = messages.map((message) => ({
        _id: message._id,
        text: message.text,
        sender: message.sender,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        isMine:
            message.sender._id.toString() ===
            loggedInUserId.toString(),
    }));

    // 6. Send response
    return res.status(200).json(
        new ApiResponse(
            200,
            messagesWithOwnership,
            "Messages loaded successfully"
        )
    );
});

export { loadMessages };

