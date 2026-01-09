import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler( async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ", "");
    
        if (!token) {
            throw ApiError(401, "Unauthorized");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken._id)
        .select("-password")
    
        if (!user) {
            // Todo : discuss about forntend
            throw ApiError(401, "Unauthorized");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }

})