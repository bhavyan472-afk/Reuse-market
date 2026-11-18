"use client";

import { createContext, useContext, type ReactNode } from "react";

export type SessionValue = {
  userId: string | null;
  fullName: string | null;
  avatarUrl: string | null;
};

const SessionContext = createContext<SessionValue>({ userId: null, fullName: null, avatarUrl: null });

export function SessionProvider({ value, children }: { value: SessionValue; children: ReactNode }) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
