import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { Role } from "@prisma/client";

const roleSchema = z.object({
  role: z.nativeEnum(Role),
});

export async function PUT(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
      },
    });

    if (currentUser?.role !== "owner") {
      return NextResponse.json(
        { error: "Only owners can modify user roles" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = roleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    const { role } = result.data;
    const { memberId } = params;

    const updatedUser = await prisma.user.update({
      where: { id: memberId },
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