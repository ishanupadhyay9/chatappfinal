import { Router } from "express";
import { login, logout, signup,updateInfo } from "../controllers/auth.js";
import { protectRoute } from "../middlewares/updat.js";

const router = Router();


router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/update",updateInfo);
router.get("/me", protectRoute, (req,res)=>{
    return res.status(200).json({success:true, user:req.user});
})
export default router;

