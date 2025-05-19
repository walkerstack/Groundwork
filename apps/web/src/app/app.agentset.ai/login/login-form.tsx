"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2Icon } from "lucide-react";

export function LoginForm({
  className,
  redirectParam,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  redirectParam?: string;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const redirect =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : "/";

  const { mutateAsync: sendMagicLink, isPending: isSendingMagicLink } =
    useMutation({
      mutationFn: async ({ email }: { email: string }) => {
        await authClient.signIn.magicLink({ email, callbackURL: redirect });
      },
      onSuccess: () => {
        setSent(true);
      },
    });

  const { mutateAsync: googleLogin, isPending: isLoggingInWithGoogle } =
    useMutation({
      mutationFn: () =>
        authClient.signIn.social({ provider: "google", callbackURL: redirect }),
    });

  const { mutateAsync: githubLogin, isPending: isLoggingInWithGithub } =
    useMutation({
      mutationFn: () =>
        authClient.signIn.social({ provider: "github", callbackURL: redirect }),
    });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendMagicLink({ email: email.trim() });
  };

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-xl bg-white shadow-md ring-1 ring-black/5",
        className,
      )}
      {...props}
    >
      {sent ? (
        <div className="flex flex-col items-center justify-center p-7 sm:p-11">
          <CheckCircle2Icon className="size-8" />
          <h1 className="mt-4 text-lg font-medium">Check your email</h1>
          <p className="mt-1 max-w-2xs text-center text-sm text-gray-600">
            We've sent a magic link to your email. Click the link to login.
          </p>
        </div>
      ) : (
        <div className="p-7 sm:p-11">
          <form onSubmit={handleSubmit}>
            <div className="flex items-start">
              <a href="/" target="_blank" title="Home">
                <Logo className="h-9 fill-black" />
              </a>
            </div>
            <h1 className="mt-8 text-base/6 font-medium">Welcome back!</h1>
            <p className="mt-1 text-sm/5 text-gray-600">
              Sign in to your account to continue.
            </p>

            <div className="mt-8 space-y-3">
              <Label className="text-sm/5 font-medium" htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mt-8">
              <Button
                type="submit"
                className="w-full"
                isLoading={isSendingMagicLink}
              >
                Sign in
              </Button>
            </div>
          </form>

          <div className="after:border-border relative my-4 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => googleLogin()}
              isLoading={isLoggingInWithGoogle}
              type="button"
            >
              <GoogleIcon className="size-4" />
              Google
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => githubLogin()}
              isLoading={isLoggingInWithGithub}
              type="button"
            >
              <GithubIcon className="size-4" />
              Github
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const GithubIcon = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor" {...props}>
    <path d="M8 .198a8 8 0 0 0-8 8 7.999 7.999 0 0 0 5.47 7.59c.4.076.547-.172.547-.384 0-.19-.007-.694-.01-1.36-2.226.482-2.695-1.074-2.695-1.074-.364-.923-.89-1.17-.89-1.17-.725-.496.056-.486.056-.486.803.056 1.225.824 1.225.824.714 1.224 1.873.87 2.33.666.072-.518.278-.87.507-1.07-1.777-.2-3.644-.888-3.644-3.954 0-.873.31-1.586.823-2.146-.09-.202-.36-1.016.07-2.118 0 0 .67-.214 2.2.82a7.67 7.67 0 0 1 2-.27 7.67 7.67 0 0 1 2 .27c1.52-1.034 2.19-.82 2.19-.82.43 1.102.16 1.916.08 2.118.51.56.82 1.273.82 2.146 0 3.074-1.87 3.75-3.65 3.947.28.24.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.14.46.55.38A7.972 7.972 0 0 0 16 8.199a8 8 0 0 0-8-8Z"></path>
  </svg>
);

const GoogleIcon = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M28.458 5c6.167 0 11.346 2.2 15.368 5.804l.323.295l-6.62 6.464c-1.695-1.59-4.666-3.493-9.07-3.493c-6.204 0-11.47 4.093-13.372 9.749c-.47 1.46-.756 3.023-.756 4.64c0 1.615.287 3.18.782 4.639c1.877 5.656 7.142 9.748 13.345 9.748c3.347 0 5.928-.886 7.881-2.176l.251-.17l.307-.222c2.813-2.108 4.144-5.084 4.46-7.169l.03-.22h-12.93v-8.705h22.025c.339 1.46.495 2.867.495 4.795c0 7.142-2.554 13.163-6.985 17.255c-3.884 3.597-9.201 5.682-15.535 5.682c-9.031 0-16.85-5.102-20.772-12.57l-.184-.358l-.222-.457A23.45 23.45 0 0 1 5 28.458c0-3.6.827-7.01 2.28-10.073l.222-.457l.184-.357C11.608 10.1 19.426 5 28.458 5"
    ></path>
  </svg>
);
