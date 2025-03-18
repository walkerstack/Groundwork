/* eslint-disable @typescript-eslint/no-namespace */

type IngestJobPayloadText = {
  type: "TEXT";
  name?: string;
  text: string;
};

type IngestJobPayloadConnection = {
  type: "CONNECTION";
  connectionId: string;
};

type IngestJobPayloadFile = {
  type: "FILE";
  name?: string;
  fileUrl: string;
};

type IngestJobPayloadUrls = {
  type: "URLS";
  urls: string[];
};

type IngestJobPayloadSitemap = {
  type: "SITEMAP";
  sitemapUrl: string;
};

type IngestJobPayloadS3 = {
  type: "S3";
  bucket: string;
  prefix?: string;
  fileTypes?: string[];
};

type IngestJobPayloadGoogleDrive = {
  type: "GOOGLE_DRIVE";
  folderId: string;
  fileTypes?: string[];
};

type Payload =
  | IngestJobPayloadText
  | IngestJobPayloadConnection
  | IngestJobPayloadFile
  | IngestJobPayloadUrls
  | IngestJobPayloadSitemap
  | IngestJobPayloadS3
  | IngestJobPayloadGoogleDrive;

type OpenAIEmbeddingModel = "text-embedding-3-small" | "text-embedding-3-large";
type OpenAILanguageModel = "gpt-4o" | "gpt-4o-mini";

type Config = {
  chunkSize?: number;
  chunkOverlap?: number;
};

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

    type IngestJobPayload = Payload;

    type IngestJobConfig = Config & {
      metadata?: Record<string, unknown>;
    };

    type NamespaceVectorStoreConfig = {
      provider: "PINECONE";
      apiKey: string;
      indexHost: string;
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

    type DocumentProperties = {
      fileSize: number;
      mimeType?: string;
    };

    type DocumentSource = Payload;
    type DocumentMetadata = Record<string, unknown>;
  }
}
