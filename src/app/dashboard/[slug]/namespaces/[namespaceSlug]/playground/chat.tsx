"use client";

import { Namespace } from "@prisma/client";
import { useChat } from "@ai-sdk/react";
import { useOrganization } from "@/contexts/organization-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

function useCustomChat({ namespace }: { namespace: Namespace }) {
  const { activeOrganization } = useOrganization();
  return useChat({
    id: "chat",
    api: "/api/v1/chat",
    body: {
      topK: 5,
      stream: true,
      auth: true,
      namespaceId: namespace.id,
      organizationId: activeOrganization.id,
    },
    experimental_throttle: 50,
  });
}

export default function Chat({ namespace }: { namespace: Namespace }) {
  const { messages, status } = useCustomChat({ namespace });

  return (
    <div className="flex h-full items-center justify-center px-5">
      <div className="border-border flex h-[80vh] w-full max-w-4xl flex-col rounded-lg border shadow">
        <div className="flex w-full flex-1 flex-col gap-5 overflow-y-auto p-5">
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col gap-2 p-4">
              <div
                className={cn(
                  "max-w-[70%]",
                  message.role === "user" ? "self-end" : "",
                )}
              >
                <div
                  className={cn(
                    "flex w-full flex-col gap-3 rounded-lg p-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  <MemoizedMarkdown id={message.id} content={message.content} />
                </div>
                {message.annotations && (
                  <div className="mt-3 flex items-center gap-3 overflow-x-auto">
                    {(
                      (message.annotations as any[])?.find(
                        (annotation) => !!annotation?.["agentset_sources"],
                      )?.["agentset_sources"] as any[]
                    ).map((source, idx) => (
                      <HoverCard key={idx}>
                        <HoverCardTrigger asChild>
                          <Button variant="outline" size="sm">
                            Source {idx + 1}
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-[350px] text-xs">
                          {source.text}
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {status === "submitted" && (
            <div className="flex flex-col gap-2 p-4">
              <p>Thinking...</p>
            </div>
          )}
        </div>

        <ChatForm namespace={namespace} />
      </div>
    </div>
  );
}

export const ChatForm = ({ namespace }: { namespace: Namespace }) => {
  const { input, handleSubmit, handleInputChange, status } = useCustomChat({
    namespace,
  });

  return (
    <form className="border-border flex border-t" onSubmit={handleSubmit}>
      <Input
        placeholder="Ask a question..."
        className="rounded-none"
        value={input}
        onChange={handleInputChange}
      />

      <Button
        type="submit"
        className="rounded-none"
        isLoading={status === "submitted" || status === "streaming"}
      >
        Send
      </Button>
    </form>
  );
};
