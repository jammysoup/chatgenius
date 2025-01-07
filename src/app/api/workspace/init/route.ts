import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const defaultChannels = ['general', 'random', 'introductions'];
    
    // Create default channels if they don't exist
    await Promise.all(
      defaultChannels.map(async (channelName) => {
        const existingChannel = await prisma.channel.findUnique({
          where: { name: channelName }
        });

        if (!existingChannel) {
          await prisma.channel.create({
            data: {
              name: channelName,
              description: `Default ${channelName} channel`,
              isPrivate: false,
              // We'll set the first admin user as owner later
              ownerId: "system",
            }
          });
        }
      })
    );

    return NextResponse.json({ message: "Workspace initialized successfully" });
  } catch (error) {
    console.error("Workspace initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize workspace" },
      { status: 500 }
    );
  }
} 