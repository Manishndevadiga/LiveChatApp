import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Feedback from "../models/feedback.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


// GET logged-in user's feedback
const getFeedback = asyncHandler(async (req, res) => {

    // User comes from authentication middleware
    const userId = req?.user?._id;

    console.log("Fetching feedback for user:", userId);

    const feedback = await Feedback.findOne({
        user: userId,
    });

    // New user / user has not submitted feedback yet
    if (!feedback) {
        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "No feedback found"
            )
        );
    }

    // Feedback already exists
    return res.status(200).json(
        new ApiResponse(
            200,
            feedback,
            "Feedback fetched successfully"
        )
    );
});


// CREATE or UPDATE feedback
const createOrUpdateFeedback = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    console.log("Creating or updating feedback for user inside controller:", userId);

    const {
        rating,
        title,
        message,
    } = req.body;


    console.log("Creating or updating feedback for user:", rating,
        title,
        message,);

    // Validate fields
    if (!rating || !title?.trim() || !message?.trim()) {
        throw new ApiError(
            400,
            "Rating, title and message are required"
        );
    }

    // Check whether feedback already exists
    let feedback = await Feedback.findOne({
        user: userId,
    });


    // --------------------------------
    // HANDLE FILES
    // --------------------------------


    const uploadedFiles = [];

    if (req.files && req.files.length > 0) {
        for (const file of req.files) {

            const result = await uploadOnCloudinary(file?.path);

            if (!result) {
                throw new ApiError(
                    500,
                    `Failed to upload ${file.originalname}`
                );
            }

            uploadedFiles.push({
                originalName: file.originalname,
                fileName: result.public_id,
                publicId: result.public_id,
                mimeType: file.mimetype,
                size: file.size,
                url: result.secure_url,
            });
        }
    }


    // --------------------------------
    // CREATE NEW FEEDBACK
    // --------------------------------

    if (!feedback) {

        feedback = await Feedback.create({
            user: userId,
            rating,
            title: title.trim(),
            message: message.trim(),
            files: uploadedFiles,
        });

        return res.status(201).json(
            new ApiResponse(
                201,
                feedback,
                "Feedback submitted successfully"
            )
        );
    }


    // --------------------------------
    // UPDATE EXISTING FEEDBACK
    // --------------------------------

    feedback.rating = rating;
    feedback.title = title.trim();
    feedback.message = message.trim();


    // Only replace files if new files were uploaded
    if (uploadedFiles.length > 0) {
        feedback.files = uploadedFiles;
    }


    await feedback.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            feedback,
            "Feedback updated successfully"
        )
    );
});


export {
    getFeedback,
    createOrUpdateFeedback,
};