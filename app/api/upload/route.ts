import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';




export async function POST(req: Request) {

  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });


  try {
    // Parse the incoming form data
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'car-listings' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ 
      success: true, 
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to upload image' 
    }, { status: 500 });
  }
} 