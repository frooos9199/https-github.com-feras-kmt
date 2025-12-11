import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
// @ts-ignore
import archiver from 'archiver';
import axios from 'axios';
import { Readable } from 'stream';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        employeeId: true,
        name: true,
        image: true,
        civilIdImage: true,
        civilIdBackImage: true,
        licenseFrontImage: true,
        licenseBackImage: true,
      },
    });

    // Collect all image URLs
    const imageUrls: { url: string; filename: string; userId: string; type: string }[] = [];
    
    users.forEach((user) => {
      const employeeId = user.employeeId || user.id;
      const userName = user.name || 'Unknown';
      const sanitizedName = userName.replace(/[^a-zA-Z0-9]/g, '_');
      
      if (user.image) {
        imageUrls.push({
          url: user.image,
          filename: `${employeeId}_${sanitizedName}_profile.jpg`,
          userId: user.id,
          type: 'profile'
        });
      }
      if (user.civilIdImage) {
        imageUrls.push({
          url: user.civilIdImage,
          filename: `${employeeId}_${sanitizedName}_civilid_front.jpg`,
          userId: user.id,
          type: 'civilIdFront'
        });
      }
      if (user.civilIdBackImage) {
        imageUrls.push({
          url: user.civilIdBackImage,
          filename: `${employeeId}_${sanitizedName}_civilid_back.jpg`,
          userId: user.id,
          type: 'civilIdBack'
        });
      }
      if (user.licenseFrontImage) {
        imageUrls.push({
          url: user.licenseFrontImage,
          filename: `${employeeId}_${sanitizedName}_license_front.jpg`,
          userId: user.id,
          type: 'licenseFront'
        });
      }
      if (user.licenseBackImage) {
        imageUrls.push({
          url: user.licenseBackImage,
          filename: `${employeeId}_${sanitizedName}_license_back.jpg`,
          userId: user.id,
          type: 'licenseBack'
        });
      }
    });

    if (imageUrls.length === 0) {
      return NextResponse.json({ 
        error: 'No images found to download' 
      }, { status: 404 });
    }

    // Create a ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Stream to collect ZIP data
    const chunks: Buffer[] = [];
    
    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    const archivePromise = new Promise((resolve, reject) => {
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);
    });

    // Download and add images to archive
    let successCount = 0;
    let failCount = 0;

    for (const imageData of imageUrls) {
      try {
        // Download image
        const response = await axios.get(imageData.url, {
          responseType: 'arraybuffer',
          timeout: 30000, // 30 seconds timeout
        });

        // Add to archive
        archive.append(Buffer.from(response.data), { 
          name: imageData.filename 
        });
        
        successCount++;
      } catch (error) {
        console.error(`Failed to download ${imageData.filename}:`, error);
        failCount++;
        
        // Add error log file to ZIP
        const errorMessage = `Failed to download: ${imageData.url}\nError: ${error}\n`;
        archive.append(errorMessage, { 
          name: `_ERRORS/${imageData.filename}.txt` 
        });
      }
    }

    // Add summary file
    const summary = `KMT Images Backup Summary
========================
Date: ${new Date().toISOString()}
Total Users: ${users.length}
Total Images Found: ${imageUrls.length}
Successfully Downloaded: ${successCount}
Failed Downloads: ${failCount}

Image Types:
- Profile Photos
- Civil ID (Front & Back)
- Driver License (Front & Back)

Note: This backup can be used to restore images if needed.
Simply upload images back to Cloudinary or your image hosting service.
`;

    archive.append(summary, { name: 'README.txt' });

    // Finalize the archive
    await archive.finalize();

    // Wait for archive to complete
    const buffer = await archivePromise as Buffer;

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `KMT_Images_Backup_${timestamp}.zip`;

    // Return the ZIP file as Uint8Array
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error creating images backup:', error);
    return NextResponse.json(
      { error: 'Failed to create images backup' },
      { status: 500 }
    );
  }
}
