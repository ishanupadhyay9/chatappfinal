import { useState, useRef, useCallback, useEffect } from "react";
import useAuthUser from "../hooks/useAuthUser.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { LoaderIcon, ShipWheelIcon, UploadIcon, CameraIcon } from "lucide-react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar.jsx";
import { axiosInstance } from "../lib/axios.js";

const updateDisplayPicture = async (file, userId) => {
  try {
    console.log("API function called with:", { 
      fileName: file?.name, 
      fileSize: file?.size,
      userId 
    });
    
    if (!file) {
      throw new Error("No file provided");
    }
      throw new Error("User ID is required");
    }
    
    const formData = new FormData();
    formData.append('displayPicture', file);
    formData.append('userId', userId);

    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value instanceof File ? `File: ${value.name}` : value);
    }

    const response = await axiosInstance.post('/users/update-pic', formData, {
      withCredentials: true,
      timeout: 30000
    });

    console.log("Upload response:", response);

    if (response.status === 200 && response.data?.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Upload failed');
    }

  } catch (error) {
    console.error("Upload API Error:", error);
    
    if (error.response) {
      const errorMessage = error.response.data?.message || 
                          error.response.data?.debug?.errorMessage ||
                          `Server error: ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('Network error - please check your connection');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timeout - file too large or connection slow');
    } else {
      throw new Error(error.message || 'Upload failed');
    }
  }
};

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);

  const [formState, setFormState] = useState({
    UserId: authUser?._id,
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    profilePic: authUser?.profilePic || "",
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const cleanupPreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  const resetFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      cleanupPreviewUrl();
      toast.success("Profile onboarded successfully");
      navigate('/');
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      console.error("Onboarding error:", error);
      toast.error(error.response?.data?.message || "Failed to complete onboarding");
    },
  });

  const { mutate: uploadImageMutation } = useMutation({
    mutationFn: ({ file, userId }) => updateDisplayPicture(file, userId),
    onSuccess: (data) => {
      console.log("Upload success:", data);
      
      const profilePicUrl = data.data?.profilePic || data.profilePic;
      
      if (profilePicUrl) {
        setFormState(prev => ({ ...prev, profilePic: profilePicUrl }));
        
        cleanupPreviewUrl();
        resetFileInput();
        
        toast.success("Profile picture uploaded successfully!");
      } else {
        console.error("No profile pic URL in response:", data);
        toast.error("Upload succeeded but no image URL received");
      }
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
      
      setFormState(prev => ({ 
        ...prev, 
        profilePic: authUser?.profilePic || "" 
      }));
      
      cleanupPreviewUrl();
      resetFileInput();
    },
    onSettled: () => {
      setIsUploadingImage(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting form with state:", formState);
    onboardingMutation(formState);
  };

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    
    console.log("File selection event:", { file, userId: authUser?._id });
    
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      resetFileInput();
      return;
    }
    
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      resetFileInput();
      return;
    }

    if (!authUser?._id) {
      toast.error("User authentication required. Please refresh and try again.");
      resetFileInput();
      return;
    }

    setIsUploadingImage(true);

    cleanupPreviewUrl();

    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    
    setFormState(prev => ({ ...prev, profilePic: previewUrl }));

    console.log("Starting upload:", { fileName: file.name, userId: authUser._id });
    uploadImageMutation({ file, userId: authUser._id });
  }, [authUser?._id, cleanupPreviewUrl, resetFileInput, uploadImageMutation]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  useEffect(() => {
    return () => {
      cleanupPreviewUrl();
    };
  }, [cleanupPreviewUrl]);

  return (
    <div>
      <Navbar/>
      <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
        <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
          <div className="card-body p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Complete Your Profile</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="size-32 rounded-full bg-base-300 overflow-hidden relative">
                  {formState.profilePic ? (
                    <img
                      src={formState.profilePic}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Image load error:", e);
                        setFormState(prev => ({ 
                          ...prev, 
                          profilePic: authUser?.profilePic || "" 
                        }));
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <CameraIcon className="size-12 text-base-content opacity-40" />
                    </div>
                  )}
                  
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <LoaderIcon className="size-6 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

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

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formState.fullName}
                  onChange={(e) => setFormState(prev => ({ 
                    ...prev, 
                    fullName: e.target.value 
                  }))}
                  className="input input-bordered w-full"
                  placeholder="Your full name"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Bio</span>
                </label>
                <textarea
                  name="bio"
                  value={formState.bio}
                  onChange={(e) => setFormState(prev => ({ 
                    ...prev, 
                    bio: e.target.value 
                  }))}
                  className="textarea textarea-bordered h-24"
                  placeholder="Tell others about yourself and your language learning goals"
                />
              </div>

              <button 
                className="btn btn-primary w-full"  
                type="submit"
                disabled={isPending || isUploadingImage}
              >
                {isPending ? (
                  <>
                    <LoaderIcon className="size-5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <ShipWheelIcon className="size-5 mr-2" />
                    Update profile
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
