import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const channels = await prisma.channel.findMany({
    where: {
      OR: [
        { isPrivate: false },
        { members: { some: { id: session.user.id } } },
      ],
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
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

  return NextResponse.json(channels);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return new NextResponse("Channel name is required", { status: 400 });
    }

    const channel = await prisma.channel.create({
      data: {
        name,
        ownerId: session.user.id,
        members: {
          connect: { id: session.user.id }
        }
      },
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

    return NextResponse.json(channel);
  } catch (error) {
    console.error("Error creating channel:", error);
    return new NextResponse("Error creating channel", { status: 500 });
  }
} 