/* eslint-disable @typescript-eslint/no-namespace */

type IngestJobPayloadText = {
  source: "TEXT";
  text: string;
};

type IngestJobPayloadConnection = {
  source: "CONNECTION";
  connectionId: string;
};

type IngestJobPayloadFile = {
  source: "FILE";
  fileUrl: string;
};

type OpenAIEmbeddingModel = "text-embedding-3-small" | "text-embedding-3-large";
type OpenAILanguageModel = "gpt-4o" | "gpt-4o-mini";

export type LLMConfig =
  | {
      provider: "OPENAI";
      model: OpenAILanguageModel;
      apiKey: string;
    }
  | {
      provider: "AZURE_OPENAI";
      model: OpenAILanguageModel;
      resourceName: string;
      deployment: string;
      apiKey: string;
      apiVersion?: string;
    };

declare global {
  namespace PrismaJson {
    type ConnectionConfig = {
      authType: "OAUTH2";
      credentials: {
        accessToken: string;
        refreshToken: string | null;
      };
    };

    type IngestJobPayload =
      | IngestJobPayloadText
      | IngestJobPayloadConnection
      | IngestJobPayloadFile;

    type IngestJobConfig = {
      chunkSize?: number;
      chunkOverlap?: number;

      metadata?: Record<string, unknown>;
    };

    type NamespaceVectorStoreConfig = {
      provider: "PINECONE";
      apiKey: string;
      indexName: string;
    };

    type NamespaceFileStoreConfig = {
      provider: "S3";
      bucket: string;
      accessKeyId: string;
      secretAccessKey: string;
      endpoint: string;
      region: string;
      prefix?: string;
    };

    type NamespaceEmbeddingConfig =
      | {
          provider: "OPENAI";
          model: OpenAIEmbeddingModel;
          apiKey: string;
        }
      | {
          provider: "AZURE_OPENAI";
          model: OpenAIEmbeddingModel;
          resourceName: string;
          deployment: string;
          apiKey: string;
          apiVersion?: string;
        };

    type NamespaceLLMConfig = LLMConfig;
  }
}
