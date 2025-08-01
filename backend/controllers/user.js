
import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { uploadImageToCloudinary } from "../connects/cloudinary.js";
export async function getMyFriends(req,res){
try{
    const user = await User.findById(req.user.id).select("friends").populate("friends", "fullName profilePic bio");
    console.log(user);
    res.status(200).json(user.friends);
}
catch(error){
console.log(error);
res.status(500).json({message:"INTERNAL SERVER ERROR"})
}
}

export async function sendFriendRequest(req,res){
    try{
     const {myId,userId}= req.body;
     
     
     if(myId == userId)
     {
        return res.status(400).json({message: "You can not sed friend request to yourself"}); 
     }
    try{
         const rec = await User.findById(userId);

      if(!rec)
     {
        return res.status(404).json({message: "receiver does not exist"}); 
     }
     if(rec.friends.includes(myId))
     {        return res.status(400).json({message: "already friends"}); 
      }

         try{

             await User.findByIdAndUpdate(myId,{
        $addToSet:{friends:userId},
     });

      await User.findByIdAndUpdate(userId,{
        $addToSet:{friends:myId},
     });

   
    }
    catch(error)
    {
       res.status(500).message("error connecting to user");
    }

    }
    catch(error)
    {
        return res.status(400).json({message:"error in connecting to user"});
    }

    

 
    }
    catch(error){
        return res.status(500).json({message:"error in sending friend request"});

    }
}



export async function acceptFriendRequest(req,res) {
    try{
     const {id:requesId} = req.params;
     console.log(requesId);
     const friendRequest  = await FriendRequest.findById(requesId);
     console.log(friendRequest);
     if(!friendRequest)
     {
        return res.status(404).json({message:"friend request not found"});
     }

     if(friendRequest.recipient.toString()!== req.user.id)
     {
        return res.status(403).json({message:"you are not authorized to accept this request"});

     }
    
     await User.findByIdAndUpdate(friendRequest.sender,{
        $addToSet:{friends:friendRequest.recipient},
     });

      await User.findByIdAndUpdate(friendRequest.recipient,{
        $addToSet:{friends:friendRequest.sender},
     });

      await FriendRequest.findByIdAndUpdate(requesId,{
        status:"accepted"
     });
      return res.status(200).json({message: "Friend request accepted"});


    }
    catch(error)
    {
        console.log("error in friend request controller");
return res.status(500).json({
    message:"error in accepting friend request",
})
    }
}




export async function getFriendRequests(req,res){
    try{
         const incomingReq = await FriendRequest.find({
            recipient: req.user.id,
            status : "pending",
         }).populate("sender" , "fullName , profilePic");
  console.log(incomingReq);
         const acceptReq = await FriendRequest.find({
            recipient: req.user.id,
            status : "accepted",
         }).populate("sender" , "fullName, profilePic");

         return res.status(200).json({incomingReq, acceptReq});
    }
    catch(error)
    {
      console.log("error in finding friend requests");
      res.status(500).json({message: "Internal Server Error"});
    }
}


export async function getOutgoingFriendReqs(req,res){
    try{
      const outgoingRequests = await FriendRequest.find({
        sender:req.user.id,
        status:"pending",
      }).populate("recipient","fullName profilePic");

      return res.status(200).json({outgoingRequests});
    }
    catch(error){
       return res.status(500).json({message:"Internal server error in friendreq controller"});
    }
}


export async function findFriend(req, res) {
  const { ref } = req.body;
  const currentUserId = new mongoose.Types.ObjectId(req.user.id); // Convert to ObjectId

  try {
    const orConditions = [{ fullName: ref }];

    if (mongoose.isValidObjectId(ref)) {
      orConditions.push({ _id: new mongoose.Types.ObjectId(ref) }); // Convert ref to ObjectId too
    }

    const users = await User.find({
      $or: orConditions,
      friends: { $nin: [currentUserId] }, // Now using ObjectId
      _id: { $ne: currentUserId }, // Now using ObjectId
    }).select('-password');

    return res.status(200).json({ users });
  } catch (err) {
    console.error('Error finding friends:', err);
    return res.status(500).json({ message: 'Error finding friend' });
  }
}






