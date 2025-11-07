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

    // Convert file to base64 for Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`
    
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', base64File)
    cloudinaryFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'kmt_profiles')
    cloudinaryFormData.append('folder', 'kmt/profiles')

    const cloudinaryResponse = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: cloudinaryFormData
    })

    if (!cloudinaryResponse.ok) {
      throw new Error('Failed to upload to Cloudinary')
    }

    const cloudinaryData = await cloudinaryResponse.json()
    const imageUrl = cloudinaryData.secure_url

    // Update user image in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl }
    })

    return NextResponse.json({ 
      success: true,
      imageUrl 
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
