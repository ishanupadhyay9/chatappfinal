import React from 'react'
import useAuthUser from '../hooks/useAuthUser';
import { completeOnboarding } from '../lib/api';
import {  useQueryClient } from '@tanstack/react-query';
const Profilepage = () => {
    const { authUser } = useAuthUser();
      const queryClient = useQueryClient();
      const [formState, setFormState] = useState({
         UserId : authUser?._id,
        fullName: authUser?.fullName || "",
        bio: authUser?.bio || "",
        profilePic: authUser?.profilePic || "",
      });
  
      const onSubmit = async(e)=>{
        e.preventDefault();
        const res = await completeOnboarding(formState);
        if(res)toast.success("Profile updated successfully");
        else{toast.error("error in updating profile")};
         queryClient.invalidateQueries({ queryKey: ["authUser"] });
      }

      
  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1; // 1-100 included
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("Random profile picture generated!");
  };


  return (
    <div>hii</div>
  );
}

export default Profilepage
