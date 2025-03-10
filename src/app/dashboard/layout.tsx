import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardProvider } from "./dashboard-provider";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allHeaders = await headers();
  const [session, organization] = await Promise.all([
    auth.api.getSession({
      headers: allHeaders,
    }),
    auth.api.getFullOrganization({
      headers: allHeaders,
    }),
  ]).catch((e) => {
    console.log(e);
    redirect("/login");
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardProvider activeOrganization={organization} session={session}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </DashboardProvider>
  );
}
