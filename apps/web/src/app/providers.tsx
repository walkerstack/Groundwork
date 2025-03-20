"use client";

import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";
import { ProgressProvider } from "@bprogress/next/app";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TRPCReactProvider>
        <ProgressProvider
          height="4px"
          color="#000"
          options={{ showSpinner: false }}
          shallowRouting
        >
          {children}
        </ProgressProvider>
      </TRPCReactProvider>

      <Toaster />
    </>
  );
}
