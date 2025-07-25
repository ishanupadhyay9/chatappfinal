import express from "express";
import dotenv from "dotenv";
import { protectRoute } from "../middlewares/updat.js";
import { getMyFriends, sendFriendRequest, acceptFriendRequest, getFriendRequests, getOutgoingFriendReqs, findFriend } from "../controllers/user.js";
const userRouter  = express.Router();


userRouter.get("/friends",protectRoute, getMyFriends);
userRouter.post("/friend-request",sendFriendRequest);
userRouter.put("/friend-request/:id/accept",acceptFriendRequest);
userRouter.get("/friend-requests",protectRoute, getFriendRequests);
userRouter.get("/outgoing-friend-requests",protectRoute, getOutgoingFriendReqs);
userRouter.post("/find-friend",protectRoute,findFriend);
export default userRouter;