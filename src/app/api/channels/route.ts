import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const channels = await prisma.channel.findMany({
      where: {
        NOT: {
          name: {
            startsWith: 'dm-'  // Exclude channels that start with 'dm-'
          }
        }
      },
      include: {
        members: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(channels);
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
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