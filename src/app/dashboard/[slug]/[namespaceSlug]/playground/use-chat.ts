import { useNamespace } from "@/contexts/namespace-context";
import { useOrganization } from "@/contexts/organization-context";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";

export function useNamespaceChat() {
  const { activeOrganization } = useOrganization();
  const { activeNamespace } = useNamespace();

  return useChat({
    id: "chat",
    api: "/api/v1/chat",
    body: {
      topK: 5,
      stream: true,
      auth: true,
      namespaceId: activeNamespace.id,
      organizationId: activeOrganization.id,
    },
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    onError: () => {
      toast.error("An error occurred, please try again!");
    },
  });
}
