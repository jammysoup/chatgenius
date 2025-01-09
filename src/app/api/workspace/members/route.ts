import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Members API called");
    const session = await getServerSession(authOptions);
    console.log("Session in members API:", JSON.stringify(session, null, 2));
    
    if (!session?.user?.id) {
      console.log("No session user ID");
      return NextResponse.json({ error: "Unauthorized", members: [] }, { status: 401 });
    }

    console.log("Fetching members with user ID:", session.user.id);
    const members = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        status: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log("Raw members:", JSON.stringify(members, null, 2));

    // Add role information after fetching
    const membersWithRoles = members.map(member => {
      const isOwner = member.email === "james@sopkin.dev" || 
                     member.email === "james.sopkin@gmail.com" ||
                     member.email === "james@cursor.so" ||
                     member.email === "jamessopkin@gmail.com";
      console.log(`Member ${member.email}: isOwner = ${isOwner}`);
      return {
        ...member,
        role: isOwner ? "owner" : "user"
      };
    });

    console.log("Members with roles:", JSON.stringify(membersWithRoles, null, 2));
    return NextResponse.json({ members: membersWithRoles });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members", members: [] },
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