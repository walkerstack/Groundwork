import type { Metadata } from "next";
import { GradientBackground } from "@/components/gradient-background";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const _searchParams = await searchParams;

  return (
    <main className="overflow-hidden bg-gray-50">
      <GradientBackground />
      <div className="isolate flex min-h-dvh items-center justify-center p-6 lg:p-8">
        <LoginForm redirectParam={_searchParams.r as string} />
      </div>
    </main>
  );
}
