import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json();

    // First get the other user's details
    const otherUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, id: true },
    });

    if (!otherUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if DM channel already exists
    const existingChannel = await prisma.channel.findFirst({
      where: {
        type: "dm",
        AND: [
          { members: { some: { id: session.user.id } } },
          { members: { some: { id: userId } } },
        ],
      },
      include: {
        members: true,
      },
    });

    if (existingChannel) {
      return NextResponse.json(existingChannel);
    }

    // Create new DM channel with a generated name
    const channel = await prisma.channel.create({
      data: {
        name: `dm-${session.user.id}-${userId}`, // Add a name for the channel
        type: "dm",
        members: {
          connect: [{ id: session.user.id }, { id: userId }],
        },
        isPrivate: true, // DMs are private by default
      },
      include: {
        members: true,
      },
    });

    // Format the response to include the other user's info
    const formattedChannel = {
      ...channel,
      otherUser: channel.members.find(member => member.id === userId),
    };

    return NextResponse.json(formattedChannel);
  } catch (error) {
    console.error("Error creating DM:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 