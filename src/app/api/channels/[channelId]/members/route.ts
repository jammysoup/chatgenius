import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { channelId } = params;

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    // Check if user is a member of the channel
    const isMember = channel.members.some(
      (member) => member.id === session.user.id
    );
    if (!isMember && channel.isPrivate) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(channel.members);
  } catch (error) {
    console.error("Error fetching channel members:", error);
    return new NextResponse("Error fetching members", { status: 500 });
  }
} 