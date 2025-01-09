import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only owners can update roles
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== "owner") {
      return NextResponse.json(
        { error: "Only workspace owners can update roles" },
        { status: 403 }
      );
    }

    const { role } = await req.json();
    if (!role || !["admin", "user"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.memberId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating member role:", error);
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    );
  }
} 