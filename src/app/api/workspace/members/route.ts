import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.id);

    // Get all users without any filtering
    const allUsers = await prisma.user.findMany();
    console.log('Found users:', allUsers.length);

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
} 