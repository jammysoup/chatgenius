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
      <div className="w-full max-w-md space-y-8 p-8 bg-[#222529] rounded-lg shadow-xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-100">Create your account</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">{error}</div>
          )}
          
          <div className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Full name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Enter your full name"
                className="bg-[#2C2F33] border-gray-700 text-gray-100 placeholder-gray-500
                  focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className="bg-[#2C2F33] border-gray-700 text-gray-100 placeholder-gray-500
                  focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Create a password"
                className="bg-[#2C2F33] border-gray-700 text-gray-100 placeholder-gray-500
                  focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-gray-100 font-medium"
          >
            Create account
          </Button>

          <div className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 