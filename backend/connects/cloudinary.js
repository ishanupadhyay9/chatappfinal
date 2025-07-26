import cloudinary from "cloudinary";
export async function cloudinaryConnect(){
	try {
		cloudinary.config({
			//!    ########   Configuring the Cloudinary to Upload MEDIA ########
			cloud_name: "jj0p95cj",
			api_key: "227292247444788",
			api_secret: "xgpexqlHJ-C4I42wRSR_7LJMViM",
		});
	} catch (error) {
		console.log(error);
	}
};

const cloudinary = require("cloudinary").v2

export async function uploadImageToCloudinary (file, folder, height, quality) {
  const options = { folder }
  if (height) {
    options.height = height
  }
  if (quality) {
    options.quality = quality
  }
  options.resource_type = "auto"
  console.log("OPTIONS", options)
  return await cloudinary.uploader.upload(file.tempFilePath, options)
}
