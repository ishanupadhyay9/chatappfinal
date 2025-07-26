import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import router from "./routes/auth.js";
import userRouter from "./routes/user.js"; 
import {connectDB} from "./connects/mongodb.js" 
import chatRouter from "./routes/chat.js";
import { cloudinaryConnect } from "./connects/cloudinary.js";
import fileUpload from "express-fileupload";

const auth = router;
const app = express();
const PORT = parseInt(process.env.PORT) || 3000;

// ✅ FIXED: Enhanced file upload configuration
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp",
        createParentPath: true,
        limits: { 
            fileSize: 10 * 1024 * 1024 // 10MB limit
        },
        debug: process.env.NODE_ENV === 'development', // Enable debug in development
        abortOnLimit: true
    })
);

cloudinaryConnect();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://quickchat-frontend-ah2p.onrender.com"
    ],
    credentials: true,  
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // This was missing!
app.use(cookieParser());

// Routes
app.use("/api/auth", auth);
app.use("/api/users", userRouter);
app.use("/api/chat", chatRouter);

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server is listening at port ${PORT}`);
    console.log('✅ File upload middleware configured');
    console.log('✅ Environment:', process.env.NODE_ENV || 'development');
});

connectDB();
