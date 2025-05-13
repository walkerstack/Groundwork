import { cn } from "@/lib/utils";

import { NavUser } from "./app-sidebar/nav-user";
import { SidebarTrigger } from "./ui/sidebar";

export default function DashboardPageWrapper({
  children,
  title,
  className,
  actions,
}: {
  children: React.ReactNode;
  title: string;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-base font-medium">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {actions}
          <NavUser />
        </div>
      </header>

      <div className={cn("flex flex-1 flex-col px-8 py-10", className)}>
        {children}
      </div>
    </>
  );
}
