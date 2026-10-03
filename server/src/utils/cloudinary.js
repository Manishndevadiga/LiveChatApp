import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// console.log("Cloudinary configuration:",
//   process.env.CLOUDINARY_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_SECRET_KEY
// );

// cloudinary.config({
//   cloud_name: "dphaltxki",
//   api_key: "377393196193456",
//   api_secret: "IHX2RE4W8SXAc9VlHrWOt484cn0",
// });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});



const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (err) {
    fs.unlinkSync(localFilePath);
    console.log("cloudinary upload error ", err);
    return null;
  }
};

export { uploadOnCloudinary };
