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

export default app;