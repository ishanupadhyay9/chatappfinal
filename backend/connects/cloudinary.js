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