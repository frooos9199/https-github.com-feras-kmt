import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
// @ts-ignore
import AdmZip from 'adm-zip';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Increase size limit for Vercel
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  maxDuration: 60,
};

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the uploaded file
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('❌ No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log(`📦 Received file: ${file.name}, size: ${file.size} bytes`);

    // Validate file type
    if (!file.name.endsWith('.zip')) {
      console.error('❌ Invalid file type:', file.name);
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload a ZIP file' 
      }, { status: 400 });
    }

    // Read the ZIP file
    console.log('📂 Reading ZIP file...');
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log(`✅ ZIP buffer created: ${buffer.length} bytes`);
    
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    console.log(`📁 Found ${zipEntries.length} entries in ZIP`);

    let uploaded = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Process each file in the ZIP
    for (const entry of zipEntries) {
      // Skip directories and README/error files
      if (entry.isDirectory || 
          entry.entryName.startsWith('_ERRORS/') || 
          entry.entryName === 'README.txt') {
        skipped++;
        continue;
      }

      try {
        // Parse filename: KMT-100_Ali_Ahmed_profile.jpg
        const filename = entry.entryName;
        const parts = filename.split('_');
        
        if (parts.length < 3) {
          errors.push(`Invalid filename format: ${filename}`);
          failed++;
          continue;
        }

        const employeeId = parts[0]; // KMT-100
        const imageType = parts[parts.length - 1].replace('.jpg', '').replace('.png', ''); // profile, civilid, license, etc.

        // Find user by employeeId
        const user = await prisma.user.findFirst({
          where: { employeeId }
        });

        if (!user) {
          errors.push(`User not found for ${employeeId}: ${filename}`);
          failed++;
          continue;
        }

        // Get image buffer
        const imageBuffer = entry.getData();

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'kmt',
              resource_type: 'image',
              public_id: `${employeeId}_${imageType}_${Date.now()}`,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(imageBuffer);
        });

        const imageUrl = (uploadResult as any).secure_url;

        // Update database based on image type
        const updateData: any = {};
        
        if (imageType === 'profile') {
          updateData.image = imageUrl;
        } else if (imageType.includes('civilid') && imageType.includes('front')) {
          updateData.civilIdImage = imageUrl;
        } else if (imageType.includes('civilid') && imageType.includes('back')) {
          updateData.civilIdBackImage = imageUrl;
        } else if (imageType.includes('license') && imageType.includes('front')) {
          updateData.licenseFrontImage = imageUrl;
        } else if (imageType.includes('license') && imageType.includes('back')) {
          updateData.licenseBackImage = imageUrl;
        } else {
          errors.push(`Unknown image type: ${imageType} for ${filename}`);
          failed++;
          continue;
        }

        // Update user record
        await prisma.user.update({
          where: { id: user.id },
          data: updateData
        });

        uploaded++;

      } catch (error) {
        console.error(`Error processing ${entry.entryName}:`, error);
        failed++;
        errors.push(`Failed to upload ${entry.entryName}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Images upload completed',
      stats: {
        total: zipEntries.length,
        uploaded,
        failed,
        skipped,
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('❌ Error uploading images:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      { 
        error: 'Failed to upload images',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
