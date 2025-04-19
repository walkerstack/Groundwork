import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 lg:px-6">
        <div className="flex w-full items-center gap-1 lg:gap-2">
          <h1 className="text-base font-medium">{title}</h1>
        </div>

        {actions}
      </header>

      <div className={cn("flex flex-1 flex-col px-8 py-10", className)}>
        {children}
      </div>
    </>
  );
}
