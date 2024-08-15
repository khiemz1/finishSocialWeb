import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import {v2 as cloudinary} from "cloudinary";
import messageRoutes from "./routes/messageRoutes.js"
import {app, server} from "./socket/socket.js";
import morgan from "morgan";

dotenv.config();
connectDB();


const PORT = process.env.PORT || 5000; 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(morgan('dev'))
// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);

app.use((error, req, res, next) => {
    const status = error.status || 500
    return res.status(status).json({
        status: 'error',
        code: status,
        message: error.message || 'Internal Server Error'
    })
})

server.listen(PORT, ()=> console.log(`Server started at http://localhost:${PORT}`));