import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors(
    {
        credentials: true,
        origin: process.env.CORS_ORIGIN,

    }
));
app.use(express.json({
    limit: "50kb"
}));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true , limit: "50kb"}));
app.use(cookieParser());

//routes

import userRouter from "./routes/user.route.js";


app.use("/api/v1/users",userRouter);

app.use((err, req, res, next) => {
    // console.error("🔥 ERROR STACK:\n", err.stack);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
        errors: err.errors || [],
    });
});


export default app;