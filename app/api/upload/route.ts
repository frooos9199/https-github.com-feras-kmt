import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const imageType = formData.get("imageType") as string || "profile" // profile, licenseFront, licenseBack
    const targetUserId = formData.get("userId") as string || session.user.id // For admin uploads
    
    // If uploading for another user, must be admin
    if (targetUserId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only images allowed." }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload to Cloudinary
    const cloudinary = require('cloudinary').v2
    
    // Validate Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary credentials:', {
        cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
        api_key: !!process.env.CLOUDINARY_API_KEY,
        api_secret: !!process.env.CLOUDINARY_API_SECRET
      })
      return NextResponse.json({ error: "Image upload service not configured" }, { status: 500 })
    }
    
    // Configure Cloudinary from environment
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    })
    
    // Upload using buffer
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'kmt',
          public_id: `${imageType}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          resource_type: 'auto'
        },
        (error: any, result: any) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })
    
    const imageUrl = (uploadResult as any).secure_url

    // Update user image in database based on type
    const updateData: any = {}
    if (imageType === "licenseFront") {
      updateData.licenseFrontImage = imageUrl
    } else if (imageType === "licenseBack") {
      updateData.licenseBackImage = imageUrl
    } else if (imageType === "civilId") {
      updateData.civilIdImage = imageUrl
    } else if (imageType === "civilIdBack") {
      updateData.civilIdBackImage = imageUrl
    } else {
      updateData.image = imageUrl
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: updateData
    })

    return NextResponse.json({ 
      success: true,
      imageUrl 
    })
  } catch (error: any) {
    console.error("Error uploading image:", error)
    
    // More detailed error message
    const errorMessage = error?.message || error?.error?.message || "Failed to upload image"
    
    return NextResponse.json({ 
      error: "Failed to upload image",
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}
