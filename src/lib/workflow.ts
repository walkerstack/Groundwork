import { env } from "@/env";
import { Client as WorkflowClient } from "@upstash/workflow";
import { getAppUrl } from "./utils";
import { Receiver } from "@upstash/qstash";
import { Client as QstashClient } from "@upstash/qstash";

export const qstashClient = new QstashClient({
  baseUrl: env.QSTASH_URL,
  token: env.QSTASH_TOKEN,
});

const workflowClient = new WorkflowClient({
  baseUrl: env.QSTASH_URL,
  token: env.QSTASH_TOKEN,
});

export const qstashReceiver = new Receiver({
  currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
});

export const triggerIngestionJob = async ({ jobId }: { jobId: string }) => {
  return workflowClient.trigger({
    url: `${getAppUrl()}/api/workflows/ingest`,
    body: {
      jobId: jobId,
    },
  });
};

export const triggerDocumentJob = async ({
  documentId,
}: {
  documentId: string;
}) => {
  return workflowClient.trigger({
    url: `${getAppUrl()}/api/workflows/process-document`,
    body: {
      documentId: documentId,
    },
  });
};

export const triggerDeleteDocumentJob = async ({
  documentId,
  deleteJobWhenDone,
}: {
  documentId: string;
  deleteJobWhenDone?: boolean;
}) => {
  return workflowClient.trigger({
    url: `${getAppUrl()}/api/workflows/delete-document`,
    body: {
      documentId,
      deleteJobWhenDone,
    },
  });
};

export const triggerDeleteIngestJob = async ({ jobId }: { jobId: string }) => {
  return workflowClient.trigger({
    url: `${getAppUrl()}/api/workflows/delete-ingest-job`,
    body: {
      jobId,
    },
  });
};

type CancelArgs = Parameters<typeof workflowClient.cancel>[0];
export const cancelWorkflow = async (args: CancelArgs) => {
  return workflowClient.cancel(args);
};
