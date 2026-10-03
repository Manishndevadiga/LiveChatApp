import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";


const authUser = asyncHandler(async (req, _, next) => {

    const accToken = req.cookies?.accessToken;
    console.log(accToken)

    if (!accToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    const decodedAccToken = jwt.verify(
        accToken,
        process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedAccToken?._id).select("-password -Refreshtoken");

    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
});

export { authUser };
