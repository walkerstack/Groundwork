import { memo } from "react";
import { Button } from "@/components/ui/button";
import { useNamespace } from "@/contexts/namespace-context";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { BotIcon, TelescopeIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useChatSettings } from "./chat-settings.store";

const ChatInputModes = memo(() => {
  const { isAdmin } = useSession();

  const { activeNamespace } = useNamespace();
  const settings = useChatSettings(
    useShallow((s) => {
      const namespace = s.getNamespace(activeNamespace.id);
      return {
        mode: namespace.mode,
        setMode: s.setMode,
      };
    }),
  );

  const mode = settings.mode ?? "normal";

  return (
    <div className="absolute bottom-0 left-0 flex w-fit flex-row justify-end gap-2 p-2">
      <Button
        variant={mode === "normal" ? "default" : "outline"}
        className={cn(
          "rounded-full",
          mode === "normal" ? "border border-transparent" : "",
        )}
        onClick={() => settings.setMode(activeNamespace.id, "normal")}
        size="sm"
        type="button"
      >
        Normal
      </Button>

      {isAdmin && (
        <>
          <Button
            variant={mode === "agentic" ? "default" : "outline"}
            className={cn(
              "rounded-full",
              mode === "agentic" ? "border border-transparent" : "",
            )}
            onClick={() => settings.setMode(activeNamespace.id, "agentic")}
            size="sm"
            type="button"
          >
            <BotIcon className="size-4" />
            Agentic
          </Button>

          <Button
            variant={mode === "deepResearch" ? "default" : "outline"}
            className={cn(
              "rounded-full",
              mode === "deepResearch" ? "border border-transparent" : "",
            )}
            onClick={() => settings.setMode(activeNamespace.id, "deepResearch")}
            size="sm"
            type="button"
          >
            <TelescopeIcon className="size-4" />
            Deep Research
          </Button>
        </>
      )}
    </div>
  );
});

export default ChatInputModes;
