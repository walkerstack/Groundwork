import { useHosting } from "@/contexts/hosting-context";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";

export function useHostingChat() {
  const hosting = useHosting();

  return useChat({
    id: "chat",
    api: `/api/hosting-chat?namespaceId=${hosting.namespaceId}`,
    onError: () => {
      toast.error("An error occurred, please try again!");
    },
  });
}
