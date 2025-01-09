import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

// Set workspace owner
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update James Sopkin to be workspace owner
    await prisma.user.update({
      where: {
        email: "jamessopkin@gmail.com"
      },
      data: {
        role: "owner"
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting workspace owner:", error);
    return NextResponse.json(
      { error: "Failed to set workspace owner" },
      { status: 500 }
    );
  }
} 