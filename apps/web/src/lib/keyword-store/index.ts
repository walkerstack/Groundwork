import type {
  SearchIterator,
  SearchResult,
  SelectFields,
} from "@azure/search-documents";
import { env } from "@/env";
import {
  AzureKeyCredential,
  odata,
  SearchClient,
} from "@azure/search-documents";
import { metadataDictToNode } from "llamaindex";

export type KeywordSearchChunk = {
  id: string;
  text: string;
  namespaceId: string;
  tenantId?: string | null;
  documentId: string;
  metadata: string;
};

const topLevelMetadataKeys = [
  "namespaceId",
  "documentId",
  "tenantId",
] satisfies (keyof KeywordSearchChunk)[];

const keywordSearchClient = new SearchClient<KeywordSearchChunk>(
  env.AZURE_SEARCH_URL,
  env.AZURE_SEARCH_INDEX,
  new AzureKeyCredential(env.AZURE_SEARCH_KEY),
);

const safeParse = (json: string) => {
  try {
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
};

export class KeywordStore {
  constructor(
    private readonly namespaceId: string,
    private readonly tenantId?: string,
  ) {}

  private async asyncIterableToArray<T extends object>(
    iterable: SearchIterator<T, SelectFields<T>>,
  ) {
    const results: SearchResult<T, SelectFields<T>>[] = [];
    for await (const result of iterable) {
      results.push(result);
    }
    return results;
  }

  async search(
    query: string,
    {
      documentId,
      page = 1,
      limit = 10,
    }: {
      documentId?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    let filter = odata`namespaceId eq '${this.namespaceId}'`;
    if (this.tenantId) filter += ` and tenantId eq '${this.tenantId}'`;
    if (documentId) filter += ` and documentId eq '${documentId}'`;

    const results = await keywordSearchClient.search(query, {
      filter,
      top: limit,
      skip: (page - 1) * limit,
      searchFields: ["text"],
      highlightFields: "text",
      includeTotalCount: true,
      // queryType: "full",
      // searchMode: "all",
    });

    const total = results.count;
    const totalPages = total ? Math.ceil(total / limit) : 1;

    const resultsArray = await this.asyncIterableToArray(results.results);

    return {
      total,
      totalPages,
      perPage: limit,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      results: resultsArray.map((result) => {
        const document = result.document;
        const metadata = safeParse(result.document.metadata) ?? {};

        // add top-level fields back to metadata to match vector store format
        topLevelMetadataKeys.forEach((key) => {
          metadata[key] = result.document[key];
        });

        return {
          id: document.id,
          score: result.score,
          highlights: result.highlights?.text ?? [],
          node: metadataDictToNode(metadata),
        };
      }),
    };
  }

  async listIds({
    page = 1,
    limit = 1000,
    documentId,
  }: {
    page?: number;
    limit?: number;
    documentId?: string;
  } = {}) {
    let filter = odata`namespaceId eq '${this.namespaceId}'`;
    if (this.tenantId) filter += ` and tenantId eq '${this.tenantId}'`;
    if (documentId) filter += ` and documentId eq '${documentId}'`;

    const results = await keywordSearchClient.search(undefined, {
      filter,
      top: limit,
      select: ["id"],
      includeTotalCount: true,
      skip: (page - 1) * limit,
    });

    const total = results.count;
    const totalPages = total ? Math.ceil(total / limit) : 1;

    const ids: string[] = [];
    for await (const result of results.results) {
      ids.push(result.document.id);
    }

    return {
      total,
      totalPages,
      perPage: limit,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      ids,
    };
  }

  async upsert(
    chunks: {
      id: string;
      text: string;
      documentId: string;
      metadata?: Record<string, unknown>;
    }[],
  ) {
    await keywordSearchClient.mergeOrUploadDocuments(
      chunks.map((chunk) => {
        const metadata = chunk.metadata ?? {};

        // delete these from metadata since they're already top-level fields
        topLevelMetadataKeys.forEach((key) => {
          if (metadata[key]) {
            metadata[key] = undefined;
          }
        });

        return {
          id: chunk.id,
          text: chunk.text,
          namespaceId: this.namespaceId,
          tenantId: this.tenantId ?? null,
          documentId: chunk.documentId,
          metadata: JSON.stringify(metadata),
        };
      }),
    );
  }

  async deleteByIds(ids: string[]) {
    await keywordSearchClient.deleteDocuments("id", ids);
  }
}
