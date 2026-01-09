import asyncHandler from "../utils/asyncHandler.js";
console.log("asyncHandler type:", typeof asyncHandler);

import ApiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found while generating tokens");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        console.log("methods:", {
            access: typeof user.generateAccessToken,
            refresh: typeof user.generateRefreshToken,
        });
        

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating access token and refresh token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //get user details from request body
    //validate user details
    //check if user already exists(username,email)
    //check if avatar is uploaded
    //upload avatar to cloudinary,avatar
    //create user object - create user in database
    //remove password and refresh token from response
    // check for user creation
    //send response

    const { username, email, password, fullname } = req.body;
    console.log(username, email, password, fullname);

    if (
        [username, email, password, fullname].some(
            (value) => !value || value?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ username: username }, { email: email }],
    });

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath)
        : null;

    if (!avatar) {
        throw new ApiError(500, "Error uploading avatar on cloudinary");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullname,
        avatar: avatar?.url,
        coverImage: coverImage?.url || "",
    });
    // console.log(user);
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Error creating user");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, "User created successfully", createdUser));
});


const loginUser = asyncHandler(async (req, res) => {
    //get data from request body
    //user name or email
    //find user in database
    //check if user exists
    //check if password is correct
    //generate access token
    //generate refresh token
    //send cookies
    //send response

    const { username, email, password } = req.body;
    if(!username && !email){
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne(
        {$or : [{username: username}, {email: email}]},
    )

    if(!user){
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Password is incorrect");
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200,
            {
                user: loggedInUser,refreshToken,accessToken
            },
             "User logged in successfully",
            ));
});

const logoutUser = asyncHandler(async (req, res) => {
    //get refresh token from cookie
    //find user in database
    //check if user exists
    //check if refresh token is correct
    //remove refresh token from database
    //send response


    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {refreshToken: undefined},
        },
        {
            new:true

        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "User logged out successfully"));

});


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken || req.query.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await user.findById(decodedToken._id);
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token request");
        }
    
        if(user?.refreshToken !== incomingRefreshToken){
            throw new ApiError(401, "Invalid refresh token or expired");
        }
    
        const options = {
            httpOnly: true,
            secure: true,
        };
    
        const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id);
    
        res.
            status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200,
                {
                    accessToken,
                    refreshToken: newRefreshToken
                },
                 "Access token refreshed successfully"));
    } catch (error) {
        throw new ApiError(500, "Error refreshing access token");
    }

})
export { registerUser , loginUser, logoutUser, refreshAccessToken };
