import { AppSidebar } from "@/components/app-sidebar";
import DashboardPageWrapper from "@/components/dashboard-page-wrapper";
import { ModalProvider } from "@/components/modals";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModalProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardPageWrapper title="Settings">
            {children}
          </DashboardPageWrapper>
        </SidebarInset>
      </SidebarProvider>
    </ModalProvider>
  );
}
