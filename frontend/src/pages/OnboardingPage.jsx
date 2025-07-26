import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { LoaderIcon, MapPinIcon, ShipWheelIcon, UploadIcon, CameraIcon } from "lucide-react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar.jsx";
import { axiosInstance } from "../lib/axios.js";
// API function for image upload
const updateDisplayPicture = async (file, userId) => {
  const formData = new FormData();
  formData.append('displayPicture', file);
  formData.append('userId', userId);

const response = await axiosInstance.post('/users/update-pic', formData, {
    withCredentials: true
});

  if (!response) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile picture');
  }

  return response.json();
};

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  console.log(authUser);

  const [formState, setFormState] = useState({
     UserId : authUser?._id,
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    profilePic: authUser?.profilePic || "",
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      navigate('/');
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  // Image upload mutation
  const { mutate: uploadImageMutation } = useMutation({
    mutationFn: ({ file, userId }) => updateDisplayPicture(file, userId),
    onSuccess: (data) => {
      setFormState({ ...formState, profilePic: data.data.profilePic });
      toast.success("Profile picture uploaded successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload image");
    },
    onSettled: () => {
      setIsUploadingImage(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    onboardingMutation(formState);
  };

  // Handle image selection and upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploadingImage(true);

    // Create preview URL for immediate feedback
    const previewUrl = URL.createObjectURL(file);
    setFormState({ ...formState, profilePic: previewUrl });

    // Upload to Cloudinary
    uploadImageMutation({ file, userId: authUser._id });
  };

  // Function to trigger file input
  const triggerFileInput = () => {
    document.getElementById('profile-pic-input').click();
  };

  return (
    <div>
    <Navbar/>
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Complete Your Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* IMAGE PREVIEW */}
              <div className="size-32 rounded-full bg-base-300 overflow-hidden relative">
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
                
                {/* Upload loading overlay */}
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <LoaderIcon className="size-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                id="profile-pic-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Upload Image Button */}
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={triggerFileInput} 
                  className="btn btn-accent"
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? (
                    <>
                      <LoaderIcon className="size-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="size-4 mr-2" />
                      Upload Profile Picture
                    </>
                  )}
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

            <button 
              className="btn btn-primary w-full"  
              type="submit"
              disabled={isPending || isUploadingImage}
            >
              { 
                isPending ? (
                  <>
                    <LoaderIcon className="size-5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <ShipWheelIcon className="size-5 mr-2" />
                    Update profile
                  </>
                )
               }
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );

};
export default OnboardingPage;