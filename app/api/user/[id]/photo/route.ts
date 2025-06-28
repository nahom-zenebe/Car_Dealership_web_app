import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse the incoming form data
    const formData = await request.formData();
    const photo = formData.get('photo');
    
    if (!photo || typeof photo === 'string') {
      return NextResponse.json(
        { error: 'No photo uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await photo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Configure Cloudinary
    cloudinary.config({ 
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
      api_key: process.env.CLOUDINARY_API_KEY, 
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
    });

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'user-profiles',
          public_id: `${id}_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    if (!result || !result.secure_url) {
      throw new Error('Failed to get upload result from Cloudinary');
    }

    // Update user's profile photo URL in database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        profilePhotoUrl: result.secure_url
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhotoUrl: true,
        role: true
      }
    });

    return NextResponse.json({
      success: true,
      photoUrl: result.secure_url,
      user: updatedUser
    });
    
  } catch (error: any) {
    console.error('[USER_PHOTO_UPLOAD_ERROR]', error);
    return NextResponse.json(
      { error: "Failed to upload photo", details: error.message },
      { status: 500 }
    );
  }
} 