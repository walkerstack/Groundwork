import { LoginForm } from "./login-form";

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm redirectParam={searchParams.r as string | undefined} />
      </div>
    </div>
  );
}
