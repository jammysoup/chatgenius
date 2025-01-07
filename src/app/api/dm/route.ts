import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Channel {
  id: string;
  members: Member[];
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all DM channels where the current user is a member
    const dmChannels = await prisma.channel.findMany({
      where: {
        isPrivate: true,
        members: {
          some: { id: session.user.id }
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

    // Format the channels to show the other user's name
    const formattedChannels = dmChannels.map(channel => {
      const otherMember = channel.members.find(member => member.id !== session.user.id);
      return {
        id: channel.id,
        name: otherMember?.name || 'Unknown User',
        type: 'dm',
        otherUser: otherMember
      };
    });

    return NextResponse.json(formattedChannels);
  } catch (error) {
    console.error("Error fetching DM channels:", error);
    return NextResponse.json(
      { error: "Failed to fetch DM channels" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { otherUserId } = await req.json();
    if (!otherUserId) {
      return NextResponse.json({ error: "Other user ID is required" }, { status: 400 });
    }

    // Check if DM channel already exists between these users
    const existingChannel = await prisma.channel.findFirst({
      where: {
        isPrivate: true,
        AND: [
          { members: { some: { id: session.user.id } } },
          { members: { some: { id: otherUserId } } }
        ]
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

    if (existingChannel) {
      const otherMember = existingChannel.members.find(member => member.id !== session.user.id);
      return NextResponse.json({
        id: existingChannel.id,
        name: otherMember?.name || 'Unknown User',
        type: 'dm',
        otherUser: otherMember
      });
    }

    // Get other user's name for the channel name
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { name: true }
    });

    // Create new DM channel
    const newChannel = await prisma.channel.create({
      data: {
        name: `dm-${session.user.id}-${otherUserId}`,
        isPrivate: true,
        ownerId: session.user.id,
        members: {
          connect: [
            { id: session.user.id },
            { id: otherUserId }
          ]
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

    const otherMember = newChannel.members.find(member => member.id !== session.user.id);
    return NextResponse.json({
      id: newChannel.id,
      name: otherUser?.name || 'Unknown User',
      type: 'dm',
      otherUser: otherMember
    });
  } catch (error) {
    console.error("Error creating DM channel:", error);
    return NextResponse.json(
      { error: "Failed to create DM channel" },
      { status: 500 }
    );
  }
}