"use client";

import { useEffect, useState } from "react";
import { User } from "@prisma/client";

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string | null;
}

export function MembersList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch('/api/workspace/members');
        if (!response.ok) throw new Error('Failed to fetch members');
        const data = await response.json();
        setMembers(data.members);
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
              <span className="text-sm text-gray-300">{member.name}</span>
              {member.role && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  member.role === 'owner' 
                    ? 'bg-purple-100 text-purple-800'
                    : member.role === 'admin'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.role}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 