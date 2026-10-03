import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },

        files: [
            {
                originalName: {
                    type: String,
                    required: true,
                },

                fileName: {
                    type: String,
                    required: true,
                },

                publicId: {
                    type: String,
                    required: true,
                },

                mimeType: {
                    type: String,
                    required: true,
                },

                size: {
                    type: Number,
                    required: true,
                },

                url: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;