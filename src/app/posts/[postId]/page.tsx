import React from 'react';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { PostItem } from "@/components/PostItem";

interface PostItemType {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    name: string | null;
  };
  reactions: string[];
}

async function getPost(postId: string) {
  const session = await getServerSession(authOptions);
  
  const message = await prisma.message.findUnique({
    where: { id: postId },
    include: {
      user: true,
      reactions: {
        select: {
          emoji: true,
          userId: true
        }
      },
      replies: {
        include: {
          user: true,
          reactions: {
            select: {
              emoji: true,
              userId: true
            }
          }
        }
      }
    }
  })

  if (!message) return null;

  const transformedMessage: PostItemType = {
    id: message.id,
    content: message.content,
    createdAt: message.createdAt,
    author: {
      name: message.user.name
    },
    reactions: message.reactions.map((r: { emoji: string }) => r.emoji)
  }

  return transformedMessage
}

export default async function ThreadPage({ params }: { params: { postId: string } }) {
  const message = await getPost(params.postId)
  
  if (!message) {
    notFound()
  }

  return (
    <div className="flex flex-col space-y-4">
      <PostItem
        post={message}
        showActions={true}
      />
    </div>
  )
} 