import { env } from "@/env";
import { Client } from "@upstash/workflow";
import { getBaseUrl } from "./utils";

const client = new Client({ token: env.QSTASH_TOKEN });

type TriggerArgs = Omit<Parameters<typeof client.trigger>[0], "url"> & {
  /**
   * The relative URL of the workflow endpoint.
   *
   * @default `/api/workflow`
   */
  relativeUrl?: string;
};
export const triggerWorkflow = async ({
  relativeUrl = "/api/workflow",
  ...args
}: TriggerArgs) => {
  return client.trigger({
    url: `${getBaseUrl()}${relativeUrl}`,
    ...args,
  });
};

type CancelArgs = Parameters<typeof client.cancel>[0];
export const cancelWorkflow = async (args: CancelArgs) => {
  return client.cancel(args);
};
