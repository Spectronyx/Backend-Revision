import express from "express";
import "dotenv/config";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import app from "./app.js";


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server started at port ${process.env.PORT}`);
    });
})
.catch((err)=>{
    console.log("Error connecting to DB",err);
})












// ;(async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         console.log("Connected to DB");

//         app.on("error", (err)=>{
//             console.log("Error in server",err);
//         });

//         app.listen(process.env.PORT, ()=>{
//             console.log(`Server started at port ${process.env.PORT}`);
//         });

//     } catch (error) {
//         console.log("Error connecting to DB",error);
//     }
// })();