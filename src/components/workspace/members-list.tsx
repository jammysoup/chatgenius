"use client";

import { useEffect, useState } from "react";
import { User } from "@prisma/client";

interface WorkspaceMember {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string | null;
  isOnline?: boolean;
}

const ROLE_PRIORITY = {
  owner: 1,
  admin: 2,
  user: 3,
};

export function WorkspaceMembersList() {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
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

  const sortedAndGroupedMembers = members.reduce<{
    online: WorkspaceMember[];
    offline: WorkspaceMember[];
  }>(
    (acc, member) => {
      const list = member.isOnline ? acc.online : acc.offline;
      list.push(member);
      return acc;
    },
    { online: [], offline: [] }
  );

  // Sort members by role within each group
  const sortByRole = (a: WorkspaceMember, b: WorkspaceMember) => {
    const roleA = ROLE_PRIORITY[a.role?.toLowerCase() as keyof typeof ROLE_PRIORITY] || ROLE_PRIORITY.user;
    const roleB = ROLE_PRIORITY[b.role?.toLowerCase() as keyof typeof ROLE_PRIORITY] || ROLE_PRIORITY.user;
    
    if (roleA === roleB) {
      // If roles are the same, sort alphabetically by name
      return (a.name || '').localeCompare(b.name || '');
    }
    return roleA - roleB;
  };

  sortedAndGroupedMembers.online.sort(sortByRole);
  sortedAndGroupedMembers.offline.sort(sortByRole);

  const renderMemberItem = (member: WorkspaceMember) => (
    <li key={member.id} className="flex items-center gap-2 py-1">
      <div className="relative">
        {member.image ? (
          <img
            src={member.image}
            alt={member.name || "User"}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            {member.name?.[0] || "?"}
          </div>
        )}
        <span 
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#222529] ${
            member.isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`} 
        />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm text-gray-300 truncate">
          {member.name || member.email}
        </span>
        {member.role && (
          <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${
            member.role.toLowerCase() === 'owner' 
              ? 'bg-purple-100 text-purple-800'
              : member.role.toLowerCase() === 'admin'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {member.role}
          </span>
        )}
      </div>
    </li>
  );

  if (isLoading) {
    return <div className="text-gray-400 text-sm p-4">Loading members...</div>;
  }

  return (
    <div className="p-4">
      {/* Online Members */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-2">
          Online — {sortedAndGroupedMembers.online.length}
        </h3>
        <ul className="space-y-2">
          {sortedAndGroupedMembers.online.map(renderMemberItem)}
        </ul>
      </div>

      {/* Offline Members */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-2">
          Offline — {sortedAndGroupedMembers.offline.length}
        </h3>
        <ul className="space-y-2">
          {sortedAndGroupedMembers.offline.map(renderMemberItem)}
        </ul>
      </div>
    </div>
  );
} 