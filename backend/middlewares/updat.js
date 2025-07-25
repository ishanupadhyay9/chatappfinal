import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();
export async function protectRoute(req,res,next){

    try{
        const token = req.cookies.jwt;
  console.log(token);
     if(!token){
        return res.status(401).json({message:"unauthorized access no token found"});
     }

     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
     if (!decoded)
     {
              return res.status(401).json({message:"unauthorized access wrong token "});
     }
     const user = await User.findById(decoded.userId).select("-password");
      if (!user)
     {
              return res.status(401).json({message:"user not found "});
     }
     console.log("user authenticated");
     req.user=user;
     next();
    }
    catch(error){
        return res.status(500).json({message:"unauthorized access"});
    }
}