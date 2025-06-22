import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});



export async function uploadBase64ToCloudinary(base64Data: string, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      base64Data,
      { folder },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) return reject(new Error('No URL returned from Cloudinary'));
        resolve(result.secure_url);
      }
    );
  });
}
