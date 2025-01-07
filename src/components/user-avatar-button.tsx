"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface UserAvatarButtonProps {
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
}

export function UserAvatarButton({ user }: UserAvatarButtonProps) {
  const router = useRouter();

  const startConversation = async () => {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const { conversationId } = await res.json();
    router.push(`/conversations/${conversationId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user.image ?? ""} />
          <AvatarFallback>{user.name?.[0]}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={startConversation}>
          Send message
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 