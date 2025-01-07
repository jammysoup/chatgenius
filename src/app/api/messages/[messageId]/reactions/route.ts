import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const reactionSchema = z.object({
  emoji: z.string(),
})

interface ReactionCount {
  emoji: string
  _count: number
}

interface UserReaction {
  emoji: string
}

export async function POST(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await req.json()
    const { emoji } = reactionSchema.parse(json)

    // Toggle reaction (delete if exists, create if doesn't)
    const existingReaction = await prisma.messageReaction.findUnique({
      where: {
        userId_messageId_emoji: {
          userId: session.user.id,
          messageId: params.messageId,
          emoji,
        },
      },
    })

    if (existingReaction) {
      await prisma.messageReaction.delete({
        where: { id: existingReaction.id },
      })
      return Response.json({ status: "removed" })
    }

    await prisma.messageReaction.create({
      data: {
        emoji,
        userId: session.user.id,
        messageId: params.messageId,
      },
    })

    return Response.json({ status: "added" })
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reactions = await prisma.messageReaction.groupBy({
      by: ["emoji"],
      where: { messageId: params.messageId },
      _count: true,
    })

    const userReactions = await prisma.messageReaction.findMany({
      where: {
        messageId: params.messageId,
        userId: session.user.id,
      },
      select: { emoji: true },
    })

    const EMOJI_OPTIONS = ["👍", "❤️", "😄", "😮", "😢", "😡"]
    const formattedReactions = EMOJI_OPTIONS.map((emoji) => ({
      emoji,
      count: (reactions as ReactionCount[]).find((r) => r.emoji === emoji)?._count ?? 0,
      hasReacted: (userReactions as UserReaction[]).some((r) => r.emoji === emoji),
    }))

    return Response.json(formattedReactions)
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 