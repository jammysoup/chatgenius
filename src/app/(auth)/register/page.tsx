"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Something went wrong");
        return;
      }

      router.push("/login");
    } catch (error) {
      setError("Something went wrong");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1A1D21]">
      <div className="w-full max-w-md space-y-8 p-6 bg-[#222529] rounded-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Create your account</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          
          <div className="space-y-4">
            <div>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Full name"
                className="bg-[#1A1D21] border-gray-700"
              />
            </div>
            <div>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email address"
                className="bg-[#1A1D21] border-gray-700"
              />
            </div>
            <div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password"
                className="bg-[#1A1D21] border-gray-700"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Create account
          </Button>

          <div className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 