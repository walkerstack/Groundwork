import {
  AzureEmbeddingConfigSchema,
  GoogleEmbeddingConfigSchema,
  OpenAIEmbeddingConfigSchema,
  PineconeVectorStoreConfigSchema,
  VoyageEmbeddingConfigSchema,
} from "@agentset/validation";

import AnthropicIcon from "../icons/anthropic";
import MicrosoftAzureIcon from "../icons/azure";
import GoogleIcon from "../icons/google";
import OpenAIIcon from "../icons/openai";
import PineconeIcon from "../icons/pinecone";
import QdrantIcon from "../icons/qdrant";
import UpstashIcon from "../icons/upstash";

export const embeddingModels = [
  {
    value: AzureEmbeddingConfigSchema.shape.provider.value,
    models: AzureEmbeddingConfigSchema.shape.model.options,
    icon: MicrosoftAzureIcon,
  },
  {
    value: OpenAIEmbeddingConfigSchema.shape.provider.value,
    models: OpenAIEmbeddingConfigSchema.shape.model.options,
    icon: OpenAIIcon,
  },
  {
    value: VoyageEmbeddingConfigSchema.shape.provider.value,
    models: VoyageEmbeddingConfigSchema.shape.model.options,
    icon: AnthropicIcon,
  },
  {
    value: GoogleEmbeddingConfigSchema.shape.provider.value,
    models: GoogleEmbeddingConfigSchema.shape.model.options,
    icon: GoogleIcon,
  },
];

export const vectorStores = [
  {
    value: PineconeVectorStoreConfigSchema.shape.provider.value,
    icon: PineconeIcon,
  },
  {
    value: "upstash",
    comingSoon: true,
    icon: UpstashIcon,
  },
  {
    value: "qdrant",
    comingSoon: true,
    icon: QdrantIcon,
  },
];
