"use client";

import { SessionProvider as AuthProvider } from "next-auth/react";

interface SessionProviderProps {
  children: React.ReactNode;
  session: any;
}

const SessionProvider = ({ children, session }: SessionProviderProps) => {
  return <AuthProvider session={session}>{children}</AuthProvider>;
};

export default SessionProvider; 