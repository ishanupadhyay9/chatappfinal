import express from "express";
import { protectRoute } from "../middlewares/updat.js";
import { getStreamToken } from "../controllers/chat.js";

const chatRouter = express.Router();

chatRouter.get("/token",protectRoute,getStreamToken);

export default chatRouter;