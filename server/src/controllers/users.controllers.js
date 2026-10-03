import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";



const generateAccessAndRefreshTokens = async (userID) => {
    try {
        const user = await User.findById(userID);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        console.log("User accessToken:", accessToken);
        console.log("User refreshToken:", refreshToken);

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return {
            accessToken,
            refreshToken,
        };
    } catch (error) {
        console.error("Token generation error:", error);

        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access tokens"
        );
    }
};


const checkAuth = asyncHandler(async (req, res) => {
    console.log("Cookies:", req.cookies);

    const accessToken = req.cookies.accessToken;

    console.log("Access token:", accessToken);

    if (!accessToken) {
        throw new ApiError(401, "Authentication required");
    }

    try {
        const decodedToken = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET
        );

        console.log("Decoded token:", decodedToken);

        const user = await User.findById(decodedToken._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "User not found");
        }

        return res.status(200).json({
            success: true,
            user,
            message: "Authentication successful",
        });
    } catch (error) {
        console.error("Check auth error:", error);

        throw new ApiError(
            401,
            "Invalid or expired access token"
        );
    }
});


const userSignup = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (
        [name, email, password].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    // Generate JWT tokens
    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    // Get user without password
    const createdUser = await User.findById(user._id).select(
        "-password"
    );

    const cookieOptions = {
        httpOnly: true,
        secure: false, // true in production with HTTPS
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json({
            success: true,
            user: createdUser,
            message: "User created successfully",
        });
});


const userLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate fields
    if (
        [email, password].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // Find user
    const loggedUser = await User.findOne({ email });

    if (!loggedUser) {
        throw new ApiError(400, "User does not exist");
    }

    // Check password
    const passwordCheck =
        await loggedUser.isPasswordCorrect(password);

    if (!passwordCheck) {
        throw new ApiError(400, "Password is incorrect");
    }

    // Generate tokens
    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(loggedUser._id);

    // Get user without sensitive fields
    const loggedUserInfo = await User.findById(
        loggedUser._id
    ).select("-password -refreshToken");

    // Cookie options
    const cookieOptions = {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // Set cookies and return user
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json({
            success: true,
            user: loggedUserInfo,
            message: "Logged in successfully",
        });
});


const userLogout = asyncHandler(async (req, res) => {

    console.log("Cookies on logout:", req.user);


    const userId = req.user._id;

    await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                refreshToken: null,
            },
        },
        {
            new: true,
        }
    );

    const cookieOptions = {
        httpOnly: true,
        secure: false, // true in production with HTTPS
        sameSite: "Strict",
    };

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json({
            success: true,
            message: "User logged out successfully",
        });
});

const userResetPassword = asyncHandler(async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    if ([email, oldPassword, newPassword].some((field) => field?.trim() === "")) {
        throw new ApiError(
            400,
            "Email, old password, and new password are required"
        );
    }

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    if (!doctor.isVerified) {
        throw new ApiError(
            403,
            "Doctor is not verified. Password reset is not allowed."
        );
    }

    const isPasswordCorrect = await doctor.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old password is incorrect");
    }

    const isSamePassword = await doctor.isPasswordCorrect(newPassword);
    if (isSamePassword) {
        throw new ApiError(
            400,
            "New password cannot be the same as the old password"
        );
    }

    doctor.password = newPassword;
    await doctor.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password reset successfully"));
});


// const subscribeUser = async (req, res) => {
//     console.log("Subscription received:", req.body);

//     res.status(200).json({
//         success: true,
//         message: "Subscription saved"
//     });
// };


const subscribeUser = async (req, res) => {
    try {
        const subscription = req?.body;

        console.log("Subscription received:", subscription, "User ID:", req.user?._id);

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                pushSubscription: subscription
            },
            {
                new: true
            }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Subscription saved"
        });

    } catch (error) {
        console.error("Subscription error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save subscription"
        });
    }
};


export {
    checkAuth,
    userSignup,
    userLogin,
    userLogout,
    userResetPassword,
    subscribeUser
};
