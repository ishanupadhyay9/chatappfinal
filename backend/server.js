
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import router from "./routes/auth.js";
import userRouter from "./routes/user.js"; 
import {connectDB} from "./connects/mongodb.js" 
import chatRouter from "./routes/chat.js";
const auth = router;

const app = express();
const PORT = parseInt(process.env.PORT) || 3000;
app.use(cors(
    {
        origin:"http://localhost:5173",
        credentials: true // allow frontend to send cookies
    }
)) ; 
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", auth);
app.use("/api/users", userRouter);
app.use("/api/chat",chatRouter);

app.get("/", (req, res) => {
    res.send("Hello world");
});


app.listen(PORT, () => {
    console.log(`server is listening at port ${PORT}`);
});
connectDB();
