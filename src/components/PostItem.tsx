"use client";

import { PostReactions } from "./post-reactions";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PostItemProps {
  post: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      name: string | null;
    };
    reactions: string[];
  };
  showActions?: boolean;
}

export function PostItem({ post, showActions = true }: PostItemProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarFallback>{post.author.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="font-semibold">{post.author.name}</div>
          <div className="text-sm text-muted-foreground">
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p>{post.content}</p>
      </CardContent>
      {showActions && (
        <CardFooter>
          <PostReactions post={post} />
        </CardFooter>
      )}
    </Card>
  );
} 