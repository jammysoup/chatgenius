import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only owners can remove members
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== "owner") {
      return NextResponse.json(
        { error: "Only workspace owners can remove members" },
        { status: 403 }
      );
    }

    // Cannot remove owners
    const targetUser = await prisma.user.findUnique({
      where: { id: params.memberId },
      select: { role: true },
    });

    if (targetUser?.role === "owner") {
      return NextResponse.json(
        { error: "Cannot remove workspace owners" },
        { status: 403 }
      );
    }

    // Delete user's messages and reactions first
    await prisma.messageReaction.deleteMany({
      where: { userId: params.memberId },
    });

    await prisma.message.deleteMany({
      where: { userId: params.memberId },
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: params.memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
} 