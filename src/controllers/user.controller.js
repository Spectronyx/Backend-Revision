import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js";

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

    const { username, email, password ,fullname} = req.body;
    console.log(username,email,password,fullname);

    if([username,email,password,fullname].some((value)=>
        value?.trim(""))
    ){
        throw new ApiError(400,"All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{username: username,},{email: email,},]
    })

    if(existingUser){
        throw new ApiError(409,"User already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required");
    }

    const avatar = uploadOnCloudinary(avatarLocalPath);
    const coverImage = uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(500,"Error uploading avatar on cloudinary");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email: email,
        password: password,
        fullname: fullname,
        avatar: avatar?.url,
        coverImage: coverImage?.url || "",
    });
    
    const createdUser = await User.findById(user._id)
    .select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500,"Error creating user");
    }


    return res.status(201).json(
        new ApiResponse(201,"User created successfully",createdUser)
    );

});

export { registerUser };