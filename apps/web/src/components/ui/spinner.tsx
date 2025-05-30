import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";

export function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon className={cn("size-4 animate-spin", className)} {...props} />
  );
}
