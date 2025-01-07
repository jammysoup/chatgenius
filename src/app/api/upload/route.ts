import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as Blob
    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 })
    }

    // Generate unique filename
    const buffer = Buffer.from(await file.arrayBuffer())
    const hash = crypto.createHash('md5').update(buffer).digest('hex')
    const ext = file.type.split('/')[1] || 'bin'
    const filename = `${hash}-${Date.now()}.${ext}`

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), "public/uploads")
    await mkdir(uploadsDir, { recursive: true })

    // Write file
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // Return the public URL
    return NextResponse.json({ 
      url: `/uploads/${filename}`,
      type: file.type.startsWith('image/') ? 'image' : 'file'
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return new NextResponse(
      "Error uploading file", 
      { status: 500 }
    )
  }
} 