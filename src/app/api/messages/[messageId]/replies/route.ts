import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('Fetching replies for message:', params.messageId);

    const replies = await prisma.message.findMany({
      where: {
        parentId: params.messageId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reactions: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log('Found replies:', replies);
    return NextResponse.json(replies);
  } catch (error) {
    console.error('Error in GET /api/messages/[messageId]/replies:', error);
    return NextResponse.json(
      { error: "Failed to fetch replies" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();
    console.log('Creating reply for message:', params.messageId, 'content:', content);

    const parentMessage = await prisma.message.findUnique({
      where: { id: params.messageId },
      select: { channelId: true },
    });

    if (!parentMessage) {
      return NextResponse.json(
        { error: "Parent message not found" },
        { status: 404 }
      );
    }

    const reply = await prisma.message.create({
      data: {
        content,
        userId: session.user.id,
        channelId: parentMessage.channelId,
        parentId: params.messageId,
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

    console.log('Created reply:', reply);
    return NextResponse.json(reply);
  } catch (error) {
    console.error('Error in POST /api/messages/[messageId]/replies:', error);
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 }
    );
  }
} 