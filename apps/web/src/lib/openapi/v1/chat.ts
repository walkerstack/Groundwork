import type {
  ZodOpenApiOperationObject,
  ZodOpenApiPathsObject,
} from "zod-openapi";
import { openApiErrorResponses, successSchema } from "@/lib/openapi/responses";
import z from "@/lib/zod";
import { chatResponseSchema, chatSchema } from "@/schemas/api/chat";
import { tenantHeaderSchema } from "@/schemas/api/tenant";

export const chat: ZodOpenApiOperationObject = {
  operationId: "chat",
  "x-speakeasy-name-override": "chat",
  summary: "Chat with a namespace",
  description: "Chat with a namespace.",
  requestParams: {
    path: z.object({
      namespaceId: z.string().describe("The id of the namespace to chat with."),
    }),
    header: tenantHeaderSchema,
  },
  requestBody: {
    content: {
      "application/json": {
        schema: chatSchema,
      },
    },
  },
  responses: {
    "200": {
      description: "The retrieved namespace",
      content: {
        "application/json": {
          schema: successSchema(chatResponseSchema),
        },
      },
    },
    ...openApiErrorResponses,
  },
  tags: ["Chat"],
  security: [{ token: [] }],
};

export const chatPaths: ZodOpenApiPathsObject = {
  "/v1/namespace/{namespaceId}/chat": {
    post: chat,
  },
};
