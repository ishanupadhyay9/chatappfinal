import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema(
{
  fullName:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true,
    unique:true,
    
  },
      isOnboarded: {
      type: Boolean,
      default: false,
    },
   password:{
    type:String,
    required:true,
  minlength:6  
  },
  profilePic:{
    type: String,
    default:"",
  },
  bio:{
    type:String,
    default:"",
  },
  friends: 
  [{
    type:mongoose.Schema.ObjectId,
    ref:"User",
  }]
 

}
, {timestamps:true});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    try{
   const salt  = await bcrypt.genSalt(10);
     this.password = await bcrypt.hash(this.password,salt);
     next();
    }
    catch(error){
  next(error);
    }
})

const User = mongoose.model("User", userSchema);
export default User;