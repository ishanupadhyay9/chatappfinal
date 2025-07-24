import express from "express";
import dotenv from "dotenv";
import { protectRoute } from "../middlewares/updat.js";
import { getMyFriends, sendFriendRequest, acceptFriendRequest, getFriendRequests, getOutgoingFriendReqs, findFriend } from "../controllers/user.js";
const userRouter  = express.Router();

userRouter.use(protectRoute);
userRouter.get("/friends", getMyFriends);
userRouter.post("/friend-request/:id",sendFriendRequest);
userRouter.put("/friend-request/:id/accept",acceptFriendRequest);
userRouter.get("/friend-requests", getFriendRequests);
userRouter.get("/outgoing-friend-requests", getOutgoingFriendReqs);
userRouter.post("/find-friend",findFriend);
export default userRouter;