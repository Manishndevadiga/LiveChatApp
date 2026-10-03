import { useState, useEffect } from "react";

import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Rating,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Alert,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import callApi from "../common/scripts.tsx";

const FeedbackForm = ({ open, onClose }) => {

    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [files, setFiles] = useState([]);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    console.log("FeedbackFiles", files);

    // Handle file selection
    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);

        setFiles((previousFiles) => [
            ...previousFiles,
            ...selectedFiles,
        ]);

        // Reset input so the same file can be selected again
        event.target.value = "";
    };


    useEffect(() => {
        if (!open) return;

        const fetchFeedback = async () => {
            try {
                const response = await callApi(
                    "/feedback/getFeedback",
                    "GET"
                );

                console.log("Feedback:", response);

                if (response?.success && response?.data) {
                    const feedback = response.data;

                    setRating(feedback.rating || 0);
                    setTitle(feedback.title || "");
                    setMessage(feedback.message || "");

                    setFiles(feedback?.files || []);
                } else {
                    // No feedback found
                    setRating(0);
                    setTitle("");
                    setMessage("");
                    setFiles([]);
                }

            } catch (error) {
                console.error(
                    "Failed to fetch feedback:",
                    error
                );
            }
        };

        fetchFeedback();
    }, [open]);


    // Remove selected file
    const handleRemoveFile = (index) => {
        setFiles((previousFiles) =>
            previousFiles.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        // Frontend validation
        if (!rating) {
            setError("Please provide a rating.");
            return;
        }

        if (!title.trim()) {
            setError("Please enter a title.");
            return;
        }

        if (!message.trim()) {
            setError("Please enter your feedback.");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();

            formData.append("rating", rating);
            formData.append("title", title);
            formData.append("message", message);

            // Add files
            files?.forEach((file) => {
                formData.append("files", file);
            });


            console.log("Submitting feedback:", {
                rating,
                title,
                message,
                files,
            });

            const response = await callApi(
                "/feedback/createOrUpdateFeedback",
                "POST",
                formData
            );

            console.log("Feedback submitted:", response);

            if (!response?.success) {
                throw new Error(
                    response?.message || "Failed to submit feedback"
                );
            }

            // Clear form
            setRating(0);
            setTitle("");
            setMessage("");
            setFiles([]);

            onClose();

        } catch (error) {
            console.error("Feedback submission error:", error);

            setError(
                error.message || "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleOpenFile = (file) => {
        if (file?.url) {
            // Existing Cloudinary file
            window.open(file.url, "_blank", "noopener,noreferrer");
            return;
        }

        if (file instanceof File) {
            // Newly selected local file
            const url = URL.createObjectURL(file);

            window.open(url, "_blank", "noopener,noreferrer");

            // Don't revoke immediately because the new tab may still need it.
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >

            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "black",
                }}
            >
                Give Feedback

                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Box
                component="form"
                onSubmit={handleSubmit}
            >

                <DialogContent>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Rating */}

                    <Typography
                        component="legend"
                        sx={{ mb: 1 }}
                    >
                        How would you rate the application?
                    </Typography>

                    <Rating
                        value={rating}
                        onChange={(event, newValue) => {
                            setRating(newValue);
                        }}
                        size="large"
                    />

                    {/* Title */}

                    <TextField
                        fullWidth
                        label="Title"
                        value={title}
                        onChange={(event) =>
                            setTitle(event.target.value)
                        }
                        margin="normal"
                        inputProps={{
                            maxLength: 100,
                        }}
                        helperText={`${title?.length}/100`}
                    />

                    {/* Message */}

                    <TextField
                        fullWidth
                        label="Your Feedback"
                        value={message}
                        onChange={(event) =>
                            setMessage(event.target.value)
                        }
                        margin="normal"
                        multiline
                        rows={5}
                        inputProps={{
                            maxLength: 2000,
                        }}
                        helperText={`${message.length}/2000`}
                    />

                    {/* File upload */}

                    <Box sx={{ mt: 2 }}>

                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                        >
                            Attach Files

                            <input
                                type="file"
                                hidden
                                multiple
                                onChange={handleFileChange}
                            />
                        </Button>

                    </Box>

                    {/* Selected files */}

                    {files?.length > 0 && (
                        <List sx={{ mt: 1 }}>
                            {files.map((file, index) => (
                                <ListItem
                                    key={`${file.name || file.originalName}-${index}`}
                                    divider
                                >
                                    <ListItemText
                                        primary={
                                            <span
                                                onClick={() => handleOpenFile(file)}
                                                style={{
                                                    cursor: file.url
                                                        ? "pointer"
                                                        : "default",
                                                    textDecoration: file.url
                                                        ? "underline"
                                                        : "none",
                                                }}
                                            >
                                                {file.name || file.originalName}
                                            </span>
                                        }
                                        secondary={`${(file.size / 1024).toFixed(2)} KB`}
                                    />

                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleRemoveFile(index)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}

                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>

                    <Button
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading
                            ? "Submitting..."
                            : "Submit Feedback"}
                    </Button>

                </DialogActions>

            </Box>

        </Dialog>
    );
};

export default FeedbackForm;