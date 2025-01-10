"use client";

import { WorkspaceMembersList } from "./members-list";

export function WorkspaceMembersPanel() {
  return (
    <div className="w-64 h-full border-l border-gray-800 bg-[#222529]">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-200">
          Members
        </h2>
      </div>
      
      <WorkspaceMembersList />
    </div>
  );
} 