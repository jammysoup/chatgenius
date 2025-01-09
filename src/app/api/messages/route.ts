import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");

    if (!channelId) {
      return NextResponse.json({ error: "Channel ID is required" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { 
        channelId,
        parentId: null // Only fetch top-level messages
      },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reactions: true,
        _count: {
          select: {
            replies: true // Get count of replies
          }
        }
      },
    });

    // Transform the messages to include threadCount
    const formattedMessages = messages.map(message => ({
      ...message,
      threadCount: message._count.replies,
      _count: undefined // Remove the _count field
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, channelId } = body;

    if (!content || !channelId) {
      return NextResponse.json({ error: "Content and channel ID are required" }, { status: 400 });
    }

    // Verify channel exists and user is a member
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: { members: true }
    });

    if (!channel) {
      console.error("Channel not found:", channelId);
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const isMember = channel.members.some(member => member.id === session.user.id);
    if (!isMember && channel.isPrivate) {
      console.error("User not authorized for channel:", session.user.id, channelId);
      return NextResponse.json({ error: "Not authorized to post in this channel" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        channelId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
} 