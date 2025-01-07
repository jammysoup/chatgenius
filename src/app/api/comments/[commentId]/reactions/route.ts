import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const reactionSchema = z.object({
  emoji: z.string(),
})

export async function POST(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await req.json()
    const { emoji } = reactionSchema.parse(json)

    // Toggle reaction (delete if exists, create if doesn't)
    const existingReaction = await db.commentReaction.findUnique({
      where: {
        userId_commentId_emoji: {
          userId: session.user.id,
          commentId: params.commentId,
          emoji,
        },
      },
    })

    if (existingReaction) {
      await db.commentReaction.delete({
        where: { id: existingReaction.id },
      })
      return Response.json({ status: "removed" })
    }

    await db.commentReaction.create({
      data: {
        emoji,
        userId: session.user.id,
        commentId: params.commentId,
      },
    })

    return Response.json({ status: "added" })
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 