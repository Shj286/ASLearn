// COMP 3450: Mfon Udoh, Pasang Sherpa, Shubham Jangra
"use client";

import { SessionProvider } from "next-auth/react";

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
} 
