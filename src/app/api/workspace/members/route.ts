import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    console.log('Handling workspace members request...');
    const session = await getServerSession(authOptions);
    console.log('Session in members API:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });

    if (!session?.user?.id) {
      console.log('Unauthorized request to members API');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users in the workspace
    const members = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log('Database query results:', {
      membersFound: members.length,
      memberIds: members.map(m => m.id)
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching workspace members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
} 