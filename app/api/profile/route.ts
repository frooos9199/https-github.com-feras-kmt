import { NextRequest, NextResponse } from "next/server"import { NextRequest, NextResponse } from "next/server"import { NextRequest, NextResponse } from "next/server"

import { getServerSession } from "next-auth"

import { authOptions } from "../auth/[...nextauth]/route"import { getServerSession } from "next-auth"import { getServerSession } from "next-auth"

import { prisma } from "@/lib/prisma"

import bcrypt from "bcryptjs"import { authOptions } from "../auth/[...nextauth]/route"import { authOptions } from "../auth/[...nextauth]/route"

import jwt from "jsonwebtoken"

import { prisma } from "@/lib/prisma"import { prisma } from "@/lib/prisma"

function verifyJWT(request: NextRequest) {

  const authHeader = request.headers.get("authorization");import bcrypt from "bcryptjs"import bcrypt from "bcryptjs"

  

  if (!authHeader) {import jwt from "jsonwebtoken"import jwt from "jsonwebtoken"

    return null;

  }

  

  const token = authHeader.split(" ")[1];function verifyJWT(request: NextRequest) {function verifyJWT(request: NextRequest) {

  if (!token) {

    return null;  const authHeader = request.headers.get("authorization");  const authHeader = request.headers.get("authorization");

  }

      

  try {

    const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-key";  if (!authHeader) {  if (!authHeader) {

    const decoded = jwt.verify(token, jwtSecret);

        return null;    return null;

    if (typeof decoded === "string") {

      return null;  }  }

    }

        

    return decoded;

  } catch (err) {  const token = authHeader.split(" ")[1];  const token = authHeader.split(" ")[1];

    console.error('[Profile verifyJWT] ERROR:', err instanceof Error ? err.message : String(err));

    return null;  if (!token) {  if (!token) {

  }

}    return null;    return null;



// GET - Fetch user profile  }  }

export async function GET(request: NextRequest) {

  try {    

    // Try session first (web)

    const session = await getServerSession(authOptions)  try {  try {

    let userId = session?.user?.id;

    const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-key";    const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-key";

    // If no session, try JWT (mobile)

    if (!userId) {    const decoded = jwt.verify(token, jwtSecret);    const decoded = jwt.verify(token, jwtSecret);

      const decoded = verifyJWT(request);

      if (decoded && (decoded as any).id) {        

        userId = (decoded as any).id;

      }    if (typeof decoded === "string") {    if (typeof decoded === "string") {

    }

      return null;      return null;

    if (!userId) {

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })    }    }

    }

        

    const user = await prisma.user.findUnique({

      where: { id: userId },    return decoded;    return decoded;

      select: {

        id: true,  } catch (err) {  } catch (err) {

        employeeId: true,

        name: true,    console.error('[Profile verifyJWT] ERROR:', err instanceof Error ? err.message : String(err));    console.error('[Profile verifyJWT] ERROR:', err instanceof Error ? err.message : String(err));

        email: true,

        phone: true,    return null;    return null;

        civilId: true,

        dateOfBirth: true,  }  }

        nationality: true,

        bloodType: true,}}

        image: true,

        civilIdFrontImage: true,

        civilIdBackImage: true,

        licenseFrontImage: true,// GET - Fetch user profile// GET - Fetch user profile

        licenseBackImage: true,

        role: true,export async function GET(request: NextRequest) {export async function GET(request: NextRequest) {

      }

    })  try {  try {



    if (!user) {    // Try session first (web)    // Try session first (web)

      return NextResponse.json({ error: "User not found" }, { status: 404 })

    }    const session = await getServerSession(authOptions)    const session = await getServerSession(authOptions)



    return NextResponse.json(user)    let userId = session?.user?.id;    let userId = session?.user?.id;

  } catch (error) {

    console.error("Error fetching profile:", error)

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })

  }    // If no session, try JWT (mobile)    // If no session, try JWT (mobile)

}

    if (!userId) {    if (!userId) {

// PUT - Update user profile

export async function PUT(request: NextRequest) {      const decoded = verifyJWT(request);      const decoded = verifyJWT(request);

  try {

    const session = await getServerSession(authOptions)      if (decoded && (decoded as any).id) {      if (decoded && (decoded as any).id) {

    if (!session?.user?.id) {

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })        userId = (decoded as any).id;        userId = (decoded as any).id;

    }

      }      }

    const body = await request.json()

    console.log("Update request body:", body)    }    }

    const { name, phone, civilId, dateOfBirth, nationality, bloodType, image, currentPassword, newPassword } = body

    

    // Build update data

    const updateData: any = {}    if (!userId) {    if (!userId) {

    if (name !== undefined) updateData.name = name

    if (phone !== undefined) updateData.phone = phone      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (civilId !== undefined) updateData.civilId = civilId

    if (nationality !== undefined) updateData.nationality = nationality    }    }

    if (bloodType !== undefined) updateData.bloodType = bloodType

    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth)

    if (image !== undefined) updateData.image = image

    const user = await prisma.user.findUnique({    const user = await prisma.user.findUnique({

    console.log("Update data:", updateData)

      where: { id: userId },      where: { id: userId },

    // Handle password update

    if (currentPassword && newPassword) {      select: {      select: {

      const user = await prisma.user.findUnique({

        where: { id: session.user.id }        id: true,        id: true,

      })

        employeeId: true,        employeeId: true,

      if (!user) {

        return NextResponse.json({ error: "User not found" }, { status: 404 })        name: true,        name: true,

      }

        email: true,        email: true,

      const isValid = await bcrypt.compare(currentPassword, user.password)

      if (!isValid) {        phone: true,        phone: true,

        return NextResponse.json({ error: "Invalid current password" }, { status: 400 })

      }        civilId: true,        civilId: true,



      const hashedPassword = await bcrypt.hash(newPassword, 10)        dateOfBirth: true,        dateOfBirth: true,

      updateData.password = hashedPassword

    }        nationality: true,        nationality: true,

    console.log("Update data:", updateData)

        bloodType: true,        bloodType: true,

    // Update user

    const updatedUser = await prisma.user.update({        image: true,        image: true,

      where: { id: session.user.id },

      data: updateData,        civilIdFrontImage: true,        licenseFrontImage: true,

      select: {

        id: true,        civilIdBackImage: true,        licenseBackImage: true,

        employeeId: true,

        name: true,        licenseFrontImage: true,        role: true,

        email: true,

        phone: true,        licenseBackImage: true,      }

        civilId: true,

        dateOfBirth: true,        role: true,    })

        nationality: true,

        bloodType: true,      }

        image: true,

        civilIdFrontImage: true,    })    if (!user) {

        civilIdBackImage: true,

        licenseFrontImage: true,      return NextResponse.json({ error: "User not found" }, { status: 404 })

        licenseBackImage: true,

        role: true,    if (!user) {    }

      }

    })      return NextResponse.json({ error: "User not found" }, { status: 404 })



    console.log("Updated user:", updatedUser)    }    return NextResponse.json(user)

    return NextResponse.json(updatedUser)

  } catch (error) {  } catch (error) {

    console.error("Error updating profile:", error)

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })    return NextResponse.json(user)    console.error("Error fetching profile:", error)

  }

}  } catch (error) {    return NextResponse.json({ error: "Internal server error" }, { status: 500 })


    console.error("Error fetching profile:", error)  }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })}

  }

}// PUT - Update user profile

export async function PUT(request: NextRequest) {

// PUT - Update user profile  try {

export async function PUT(request: NextRequest) {    const session = await getServerSession(authOptions)

  try {    if (!session?.user?.id) {

    const session = await getServerSession(authOptions)      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (!session?.user?.id) {    }

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    }    const body = await request.json()

    console.log("Update request body:", body)

    const body = await request.json()    const { name, phone, civilId, dateOfBirth, nationality, bloodType, image, currentPassword, newPassword } = body

    console.log("Update request body:", body)    

    const { name, phone, civilId, dateOfBirth, nationality, bloodType, image, currentPassword, newPassword } = body    // Build update data

        const updateData: any = {}

    // Build update data    if (name !== undefined) updateData.name = name

    const updateData: any = {}    if (phone !== undefined) updateData.phone = phone

    if (name !== undefined) updateData.name = name    if (civilId !== undefined) updateData.civilId = civilId

    if (phone !== undefined) updateData.phone = phone    if (nationality !== undefined) updateData.nationality = nationality

    if (civilId !== undefined) updateData.civilId = civilId    if (bloodType !== undefined) updateData.bloodType = bloodType

    if (nationality !== undefined) updateData.nationality = nationality    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth)

    if (bloodType !== undefined) updateData.bloodType = bloodType    if (image !== undefined) updateData.image = image

    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth)

    if (image !== undefined) updateData.image = image    console.log("Update data:", updateData)



    console.log("Update data:", updateData)    // Handle password update

    if (currentPassword && newPassword) {

    // Handle password update      const user = await prisma.user.findUnique({

    if (currentPassword && newPassword) {        where: { id: session.user.id }

      const user = await prisma.user.findUnique({      })

        where: { id: session.user.id }

      })      if (!user) {

        return NextResponse.json({ error: "User not found" }, { status: 404 })

      if (!user) {      }

        return NextResponse.json({ error: "User not found" }, { status: 404 })

      }      const isValid = await bcrypt.compare(currentPassword, user.password)

      if (!isValid) {

      const isValid = await bcrypt.compare(currentPassword, user.password)        return NextResponse.json({ error: "Invalid current password" }, { status: 400 })

      if (!isValid) {      }

        return NextResponse.json({ error: "Invalid current password" }, { status: 400 })

      }      const hashedPassword = await bcrypt.hash(newPassword, 10)

      updateData.password = hashedPassword

      const hashedPassword = await bcrypt.hash(newPassword, 10)    }

      updateData.password = hashedPassword    console.log("Update data:", updateData)

    }

    console.log("Update data:", updateData)    // Update user

    const updatedUser = await prisma.user.update({

    // Update user      where: { id: session.user.id },

    const updatedUser = await prisma.user.update({      data: updateData,

      where: { id: session.user.id },      select: {

      data: updateData,        id: true,

      select: {        employeeId: true,

        id: true,        name: true,

        employeeId: true,        email: true,

        name: true,        phone: true,

        email: true,        civilId: true,

        phone: true,        dateOfBirth: true,

        civilId: true,        nationality: true,

        dateOfBirth: true,        bloodType: true,

        nationality: true,        image: true,

        bloodType: true,        role: true,

        image: true,      }

        civilIdFrontImage: true,    })

        civilIdBackImage: true,

        licenseFrontImage: true,    console.log("Updated user:", updatedUser)

        licenseBackImage: true,    return NextResponse.json(updatedUser)

        role: true,  } catch (error) {

      }    console.error("Error updating profile:", error)

    })    return NextResponse.json({ error: "Internal server error" }, { status: 500 })

  }

    console.log("Updated user:", updatedUser)}

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
