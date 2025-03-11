"use client";

import { createContext, useContext, useState } from "react";
import type { Session } from "@/lib/auth-types";

type SessionContextType = [Session, (session: Session) => void];

const SessionContext = createContext<SessionContextType>(
  null as unknown as SessionContextType,
);

export function SessionProvider({
  children,
  session: initialSession,
}: {
  children: React.ReactNode;
  session: Session;
}) {
  const [session, setSession] = useState<Session>(initialSession);

  return (
    <SessionContext.Provider value={[session, setSession]}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
}
