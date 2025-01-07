// Example API route for updating a message
import { prisma } from "@/lib/prisma";
import { Message } from "@prisma/client";
import { headers } from "next/headers";

export async function PATCH(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  const headersList = headers();
  const updatedMessage: Message = await prisma.message.update({
    where: { id: params.messageId },
    data: await req.json(),
  });

  // Emit the update to all connected clients
  if (global.socketServer) {
    global.socketServer.emit(`message:update:${params.messageId}`, updatedMessage);
  }

  return Response.json(updatedMessage);
} 