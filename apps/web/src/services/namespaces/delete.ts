import { triggerDeleteNamespace } from "@/lib/workflow";

export const deleteNamespace = async ({
  namespaceId,
}: {
  namespaceId: string;
}) => {
  // TODO: change status to deleting
  await triggerDeleteNamespace({ namespaceId });
};
