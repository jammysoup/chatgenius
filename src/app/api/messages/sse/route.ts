import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(req: Request) {
  const headersList = headers();
  const channelId = new URL(req.url).searchParams.get("channelId");

  if (!channelId) {
    return new NextResponse("Channel ID is required", { status: 400 });
  }

  const response = new Response(
    new ReadableStream({
      start(controller) {
        // Store the controller in a global map with channelId as key
        if (!global.messageControllers) {
          global.messageControllers = new Map();
        }
        if (!global.messageControllers.has(channelId)) {
          global.messageControllers.set(channelId, new Set());
        }
        const controllers = global.messageControllers.get(channelId);
        if (controllers) {
          controllers.add(controller);
        }

        // Clean up when client disconnects
        const cleanup = () => {
          const controllers = global.messageControllers.get(channelId);
          controllers?.delete(controller);
          if (controllers?.size === 0) {
            global.messageControllers.delete(channelId);
          }
        };
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    }
  );

  return response;
} 