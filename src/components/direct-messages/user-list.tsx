"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchUsers() {
      const response = await fetch("/api/workspace/members");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    }
    fetchUsers();
  }, []);

  const startDM = async (userId: string) => {
    const response = await fetch("/api/dm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: userId }),
    });

    if (response.ok) {
      const channel = await response.json();
      router.push(`/dm/${channel.id}`);
    }
  };

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <Button
          key={user.id}
          variant="ghost"
          className="w-full justify-start"
          onClick={() => startDM(user.id)}
        >
          <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
            {user.image ? (
              <img src={user.image} alt={user.name || ""} className="rounded-full" />
            ) : (
              user.name?.[0] || "?"
            )}
          </div>
          <span>{user.name}</span>
        </Button>
      ))}
    </div>
  );
} 