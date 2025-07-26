import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

import { connectDB } from "./connects/mongodb.js";
import { cloudinaryConnect } from "./connects/cloudinary.js";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import chatRouter from "./routes/chat.js";

const app = express();
const PORT = parseInt(process.env.PORT) || 3000;

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/", // Render-compatible temp directory
        createParentPath: true,
        limits: { 
            fileSize: 10 * 1024 * 1024 // 10MB
        },
        debug: false, // Disable debug inpreserveExtension: true
    })
);


cloudinaryConnect();
connectDB();


app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://quickchat-frontend-ah2p.onrender.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

//  Routes (NO global auth middleware)
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter); // Auth applied selectively inside routes
app.use("/api/chat", chatRouter);

app.get("/", (req, res) => {
    res.send("QuickChat Server Running 🚀");
});

//  Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        debug: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
});
