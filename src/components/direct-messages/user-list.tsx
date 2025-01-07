"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { User } from "@/types";

interface UserListProps {
  onDmCreated: () => void;
}

export function UserList({ onDmCreated }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    }
    fetchUsers();
  }, []);

  const startDM = async (userId: string) => {
    try {
      const response = await fetch("/api/channels/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error("Failed to create DM");
      
      const channel = await response.json();
      onDmCreated(); // Refresh DM list
      
      // Close the dialog after creating the DM
      const dialogElement = document.querySelector('[role="dialog"]');
      if (dialogElement) {
        const closeButton = dialogElement.querySelector('button[aria-label="Close"]');
        if (closeButton) {
          (closeButton as HTMLButtonElement).click();
        }
      }
    } catch (error) {
      console.error("Error creating DM:", error);
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
          <div className="flex items-center gap-2">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                {user.name?.[0] || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
} 