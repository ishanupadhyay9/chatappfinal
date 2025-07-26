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
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Complete Your Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* IMAGE PREVIEW */}
              <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                {formState.profilePic ? (
                  <img
                    src={formState.profilePic}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>

              {/* Generate Random Avatar BTN */}
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleRandomAvatar} className="btn btn-accent">
                  <ShuffleIcon className="size-4 mr-2" />
                  Generate Random Avatar
                </button>
              </div>
            </div>

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Your full name"
              />
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                className="textarea textarea-bordered h-24"
                placeholder="Tell others about yourself and your language learning goals"
              />
            </div>

           
           
            {/* SUBMIT BUTTON */}

            <button className="btn btn-primary w-full"  type="submit">
              { 
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                  Update profile
                </>
               }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profilepage
