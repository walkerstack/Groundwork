import { SessionProvider } from "@/contexts/session-context";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allHeaders = await headers();
  const session = await auth.api
    .getSession({
      headers: allHeaders,
    })
    .catch((e) => {
      console.log(e);
      redirect("/login");
    });

  if (!session) {
    redirect("/login");
  }

  return <SessionProvider session={session}>{children}</SessionProvider>;
}
