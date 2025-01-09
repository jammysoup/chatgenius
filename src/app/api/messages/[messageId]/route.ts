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

    const message = await prisma.message.findUnique({
      where: {
        id: params.messageId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        reactions: true,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json(
      { error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = await prisma.message.findUnique({
      where: { id: params.messageId },
      include: { user: true },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user is authorized to delete the message
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
      },
    });

    const canDelete = 
      message.userId === session.user.id || // Message owner
      user?.role === 'admin' ||            // Admin
      user?.role === 'owner';              // Workspace owner

    if (!canDelete) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.message.delete({
      where: { id: params.messageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
} 