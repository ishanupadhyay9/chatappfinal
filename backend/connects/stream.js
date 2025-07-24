import { StreamChat } from "stream-chat";
import dotenv from "dotenv";
dotenv.config();
const key = process.env.STREAM_API_KEY;
const secret = process.env.STREAM_API_SECRET;

if(!key || !secret)
{
    console.error("stream info missing");
}

const streamClient  = StreamChat.getInstance(key,secret);

export const upsertStreamUser = async(userData)=>{
    try{
        await streamClient.upsertUsers([userData]);
        return userData;
    }
    catch(error)
    {
        console.log("error in regestering user to stream :",error);
    }
}

export const generateStreamToken = (userId)=>{
    try{
  const userIdStr = userId.toString();
  return streamClient.createToken(userIdStr);
    }
    catch(error)
    {
 console.error("Error generating Stream token:", error);
    }
};
