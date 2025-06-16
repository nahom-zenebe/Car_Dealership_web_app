import formidable, { Files, Fields } from 'formidable';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: { bodyParser: false },
};

function parseForm(req: any): Promise<{ fields: Fields; files: Files }> {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fields, files } = await parseForm(req);

    const file = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!file) return res.status(400).json({ error: 'No image file provided' });

    const filePath = file.filepath || file.filepath;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'your_folder_name',
    });

    res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
}
