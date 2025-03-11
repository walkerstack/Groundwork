import { LoginForm } from "./login-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const _searchParams = await searchParams;

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm redirectParam={_searchParams.r as string | undefined} />
      </div>
    </div>
  );
}
