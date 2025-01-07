import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dmChannels = await prisma.channel.findMany({
      where: {
        isPrivate: true,
        members: {
          some: {
            id: session.user.id
          }
        }
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    });

    // Format DM channels to include other user's info
    const formattedDms = dmChannels.map(channel => {
      const otherUser = channel.members.find(member => member.id !== session.user.id);
      return {
        ...channel,
        name: otherUser?.name || 'Unknown User',
        otherUser
      };
    });

    return NextResponse.json(formattedDms);
  } catch (error) {
    console.error("Error fetching DMs:", error);
    return NextResponse.json(
      { error: "Failed to fetch DMs" },
      { status: 500 }
    );
  }
} 