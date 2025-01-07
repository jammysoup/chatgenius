"use client";

import { useEffect, useState } from "react";
import { User } from "@prisma/client";

export function MembersList() {
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch('/api/workspace/members');
        if (!response.ok) throw new Error('Failed to fetch members');
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMembers();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-200 mb-4">
        Members ({members.length})
      </h2>
      
      {isLoading ? (
        <div className="text-gray-400 text-sm">Loading members...</div>
      ) : (
        <ul className="space-y-2">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-2">
              {/* Add member display logic here */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 