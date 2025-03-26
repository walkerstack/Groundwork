import { useNamespace } from "@/contexts/namespace-context";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";

export function useNamespaceChat() {
  const { activeNamespace } = useNamespace();

  return useChat({
    id: "chat",
    api: `/api/chat?namespaceId=${activeNamespace.id}`,
    body: {
      topK: 15,
      rerankLimit: 5,
      rerank: true,
    },
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    onError: () => {
      toast.error("An error occurred, please try again!");
    },
  });
}
