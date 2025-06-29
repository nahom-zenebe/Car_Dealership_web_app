import { v2 as cloudinary } from 'cloudinary';
import { NextApiRequest, NextApiResponse } from 'next';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function uploadBase64ToCloudinary(base64Data: string, folder: string): Promise<string> {
  try {
    // Remove data URL prefix if present
    const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:image/jpeg;base64,${base64Image}`,
        {
          folder: folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the file from the request
    const formData = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'car-listings' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(formData);
    });

    res.status(200).json({ 
      success: true, 
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message || 'Failed to upload image' 
    });
  }
}