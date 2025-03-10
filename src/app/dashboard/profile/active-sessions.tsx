"use client";

import { authClient } from "@/lib/auth-client";
import { UAParser } from "ua-parser-js";
import { Laptop, Loader2Icon, SmartphoneIcon } from "lucide-react";
import { useState } from "react";
import type { Session } from "@/lib/auth-types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDashboard } from "../dashboard-provider";

export default function ActiveSessions({
  activeSessions,
}: {
  activeSessions: Session["session"][];
}) {
  const [isTerminating, setIsTerminating] = useState<string>();
  const { session: activeSession } = useDashboard();
  const router = useRouter();

  return (
    <div className="mt-20 flex max-w-xl flex-col gap-5">
      <p className="text-lg font-medium">Active Sessions</p>
      <ul className="flex flex-col gap-2">
        {activeSessions
          .filter((session) => session.userAgent)
          .map((session) => {
            const parsedAgent = new UAParser(session.userAgent || "");
            const isCurrentSession = session.id === activeSession.session.id;

            return (
              <div key={session.id}>
                <div className="flex items-center gap-2 font-medium text-black dark:text-white">
                  {parsedAgent.getDevice().type === "mobile" ? (
                    <SmartphoneIcon />
                  ) : (
                    <Laptop size={16} />
                  )}
                  {parsedAgent.getOS().name}, {parsedAgent.getBrowser().name}{" "}
                  {isCurrentSession && <span>(Current)</span>}
                  <button
                    className="border-muted-foreground cursor-pointer border-red-600 text-xs text-red-500 underline opacity-80"
                    onClick={async () => {
                      setIsTerminating(session.id);
                      const res = await authClient.revokeSession({
                        token: session.token,
                      });

                      if (res.error) {
                        toast.error(res.error.message);
                      } else {
                        toast.success("Session terminated successfully");
                      }
                      router.refresh();
                      setIsTerminating(undefined);
                    }}
                  >
                    {isTerminating === session.id ? (
                      <Loader2Icon size={15} className="animate-spin" />
                    ) : isCurrentSession ? (
                      "Sign Out"
                    ) : (
                      "Terminate"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
      </ul>
    </div>
  );
}
