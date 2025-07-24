import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

export async function connectDB(){
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    catch(error)
    {
        console.log(error);
        process.exit(1);
    }
}
