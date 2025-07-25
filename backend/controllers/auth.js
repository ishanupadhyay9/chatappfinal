import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { upsertStreamUser } from "../connects/stream.js";
dotenv.config();
export async function signup(req,res){
const {email, password, fullName}= req.body;
try{
  if(!email || !password || !fullName)
  {
    return res.status(400).json({message:"All fields are required"});
  }
  if(password.length < 6)
  {
     return res.status(400).json({message:"password is too short"});

  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailRegex.test(email)){
         return res.status(400).json({message:"incorrect email format"});

  }
  console.log(fullName);
  try{
    const existingUser = await User.findOne({email});
    console.log(existingUser);
    if(existingUser)
    {
              return res.status(400).json({message:"email already exists please use a different one"});
   
    }
  }
  catch(error)
  {
  console.log("error in finding user");
  }

  const idx = Math.floor(Math.random()*100)+1;
  const avatar = `https://avatar.iran.liara.run/public/${idx}.png`;
  try{
    const newUser = await User.create({
       email,
       fullName,
       password,
       profilePic:avatar,

    });

    try{
      await upsertStreamUser({
      id:newUser._id.toString(),
      name: newUser.fullName,
      image: newUser.profilePic || ""
    });
    console.log("stream user created");
    }
    catch(error)
    {
      console.log("erro in stream functionality : ", error);
    }

    const token = jwt.sign({userId:newUser._id, fullName:fullName}, process.env.JWT_SECRET_KEY, {expiresIn:"500m"});

    res.cookie("jwt",token,{maxAge: 10*60*1000,
        httpOnly:true,
        sameSite:"strict",
        
    });
    res.status(201).json({success:true, user: newUser, token:token });

  }
  catch(error){
console.log("error in creating new user", error);
res.status(500).json({message:"error in creating user"});

}
}
catch(error){
console.log("unexpected error ", error);
res.status(500).json({message:"error in signup"});
}
}


export async function login(req,res){

const{email, password}= req.body;
if(!email || !password)
{
 return res.status(200).json({message:"all fields are necessary"});
}
try{
  const user = await User.findOne({email});
  
  if(!user || user.email != email)
  {
  return  res.status(401).json({message:"invalid data entered"});
   
  }
  const ispassc = await bcrypt.compare(password,user.password);

  if(!ispassc)
  {
     return  res.status(401).json({message:"invalid data entered"});

  }

   const token = jwt.sign({userId:user._id, fullName:user.fullName}, process.env.JWT_SECRET_KEY, {expiresIn:"5m"});

    res.cookie("jwt",token,{maxAge: 24*60*60*1000,
        httpOnly:true,
        sameSite:"none",
        
    });
 return res.status(201).json({success:true, user: user , token:token });
}
catch(error)
{
return  res.status(200).json({message:"invalid data"});
}
}

export async function logout(req,res){
await res.clearCookie("jwt");
res.status(200).json({success:true, message:"logout successful"})
}

export async function updateInfo(req,res){
 
  try{
  
    const {userId,fullName, bio, profilePic}= req.body;
   
    if(!fullName || !bio){
      return res.status(400).json({message :`all fields are required`, Object:req.body});

    }

   const change = await User.findByIdAndUpdate(userId,{
      fullName,
      bio, 
      profilePic,
      isOnboarded:true ,
    },{new:true});
    if(!change){
      return res.status(404).json({message:"user not found"});
    }
   try{
     await upsertStreamUser({
      id:change._id.toString(),
      name:change.fullName,
      image:change.profilePic || "",
    })
    console.log("stream update successful");

   }
   catch(error)
   {
    console.log("stream updat error");

   }
    return res.status(200).json({success:true, user:change});
  }
  catch(error)
  {
 res.status(500).json({message:"error in updating info"});
  }

}