import { unstable_cache } from "next/cache";
import { supabase } from "./supabase";
import { Namespace } from "@prisma/client";

export const getApiKeyScopeAndOrganizationId = (apiKey: string) => {
  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("OrganizationApiKey")
        .select("scope, organizationId")
        .eq("key", apiKey)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    ["apiKey", apiKey],
    {
      tags: [`apiKey:${apiKey}`],
      revalidate: 60 * 30, // 30 mins
    },
  )();
};

export const getNamespaceConfig = async (
  namespaceId: string,
  orgId: string,
) => {
  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("namespace")
        .select("id, vectorStoreConfig, embeddingConfig")
        .eq("id", namespaceId)
        .eq("organizationId", orgId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Pick<
        Namespace,
        "id" | "vectorStoreConfig" | "embeddingConfig"
      > | null;
    },
    ["namespace", namespaceId, orgId],
    {
      tags: [`namespace:${namespaceId}`, `org:${orgId}`],
      revalidate: 60 * 30, // 30 mins
    },
  )();
};
