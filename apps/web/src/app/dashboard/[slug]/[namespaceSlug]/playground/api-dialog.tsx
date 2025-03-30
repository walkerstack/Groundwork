import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNamespace } from "@/contexts/namespace-context";
import { useOrganization } from "@/contexts/organization-context";
import { prefixId } from "@/lib/api/ids";
import { Code2Icon } from "lucide-react";

import { CodeBlock } from "./chat/code-block";

const curlExample = /* bash */ `
curl --request POST \\
  --url https://api.agentset.ai/v1/namespace/{{namespace}}/search \\
  --header 'Authorization: Bearer <token>' \\
  --header 'Content-Type: application/json' \\
  --data '{
  "query": "<string>",
  "topK": 15,
  "includeMetadata": true
}'
`;

const tsSdkExample = /* typescript */ `
import { Agentset } from "agentset";

const agentset = new Agentset({
  apiKey: "YOUR_API_KEY",
});

const ns = agentset.namespace("{{namespace}}");

const results = await ns.search({ query: "YOUR QUERY" });
console.log(results);
`;

const aiSdkExample = /* typescript */ `
import { Agentset } from "agentset";
import { DEFAULT_PROMPT, makeAgentsetTool } from "@agentset/ai-sdk";
import { generateText } from "ai";

const agentset = new Agentset({
  apiKey: "YOUR_API_KEY",
});
const ns = agentset.namespace("{{namespace}}");

const result = await generateText({
  model: gpt4o,
  tools: {
    knowledgeBase: makeAgentsetTool(ns),
  },
  system: DEFAULT_SYSTEM_PROMPT,
  messages: [
    {
      role: 'user',
      content: '<question>',
    },
  ],
  maxSteps: 3,
});
console.log(result);
`;

export default function ApiDialog() {
  const { activeNamespace } = useNamespace();
  const { activeOrganization } = useOrganization();

  const prepareExample = (example: string) => {
    const id = prefixId(activeNamespace.id, "ns_");
    return example.replace("{{namespace}}", id).trim();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Code2Icon className="size-4" />
          API
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>API</DialogTitle>
          <DialogDescription>
            Use the API to query the vector store. You'll need make an{" "}
            <a
              href={`/dashboard/${activeOrganization.slug}/settings/api-keys`}
              className="text-blue-500 underline"
              target="_blank"
            >
              API key
            </a>{" "}
            first.
          </DialogDescription>
        </DialogHeader>

        <Tabs>
          <TabsList className="my-3">
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="sdk">Javascript</TabsTrigger>
            <TabsTrigger value="ai-sdk">AI SDK</TabsTrigger>
          </TabsList>
          <TabsContent value="curl">
            <CodeBlock>{prepareExample(curlExample)}</CodeBlock>
          </TabsContent>
          <TabsContent value="sdk">
            <CodeBlock>{prepareExample(tsSdkExample)}</CodeBlock>
          </TabsContent>

          <TabsContent value="ai-sdk">
            <CodeBlock>{prepareExample(aiSdkExample)}</CodeBlock>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
