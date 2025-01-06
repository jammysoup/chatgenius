"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <div className="h-screen grid grid-cols-[260px_1fr]">
      <div className="bg-[#19171D] text-gray-300 p-4">
        <div className="pb-4 px-2 border-b border-gray-700">
          <h1 className="font-semibold text-white">ChatGenius</h1>
        </div>

        <div className="mt-4">
          <h2 className="px-2 text-sm font-medium mb-2">Channels</h2>
          <ul>
            {['general', 'random', 'introductions'].map((channel) => (
              <li key={channel}>
                <Button
                  variant="ghost"
                  className="w-full px-2 py-1 text-gray-300 hover:bg-gray-700 rounded justify-start font-normal"
                >
                  <span className="text-gray-400 mr-2">#</span>
                  {channel}
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h2 className="px-2 text-sm font-medium mb-2">Direct Messages</h2>
          <ul>
            {['Alice Chen', 'Bob Smith', 'Carol White'].map((user) => (
              <li key={user}>
                <Button
                  variant="ghost"
                  className="w-full px-2 py-1 text-gray-300 hover:bg-gray-700 rounded justify-start font-normal"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  {user}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col bg-[#1A1D21]">
        <div className="h-14 border-b border-gray-700 px-4 flex items-center">
          <h2 className="text-white font-semibold"># general</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-gray-300 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {session?.user?.name?.[0] || 'U'}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-white">{session?.user?.name || 'User'}</span>
                  <span className="text-xs text-gray-500">12:00 PM</span>
                </div>
                <p>Welcome to the general channel! 👋</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-[#222529] rounded-lg p-2">
            <Input
              type="text"
              placeholder="Message #general"
              className="bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
