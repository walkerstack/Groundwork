import { InfoIcon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function InfoTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <InfoIcon className="size-4" />
        </span>
      </TooltipTrigger>

      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}
