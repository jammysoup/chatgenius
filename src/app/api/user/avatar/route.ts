import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, we'll handle raw data
  },
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("image") as Blob;
    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    // Create uploads directory
    const uploadsDir = join(process.cwd(), "public/uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Create unique filename
    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${session.user.id}-${uniqueSuffix}.jpg`;
    const filepath = join(uploadsDir, filename);
    
    // Write file
    await writeFile(filepath, buffer);

    // Update user's image in database
    const imageUrl = `/uploads/${filename}`;
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({ 
      imageUrl,
      message: "Avatar updated successfully" 
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error uploading file" }), 
      { status: 500 }
    );
  }
} 