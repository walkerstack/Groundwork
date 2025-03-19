"use client";

import { useNamespaceChat } from "./use-chat";
import { MultimodalInput } from "./chat-input";
import { useState } from "react";
import type { Attachment } from "ai";
import { Messages } from "./messages";

export default function Chat() {
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const {
    id,
    messages,
    setMessages,
    status,
    input,
    setInput,
    handleSubmit,
    stop,
    append,
    reload,
  } = useNamespaceChat();

  // TODO: add sources
  //               {message.annotations && (
  //                 <div className="mt-3 flex items-center gap-3 overflow-x-auto">
  //                   {(
  //                     (message.annotations as any[])?.find(
  //                       (annotation) => !!annotation?.["agentset_sources"],
  //                     )?.["agentset_sources"] as any[]
  //                   ).map((source, idx) => (
  //                     <HoverCard key={idx}>
  //                       <HoverCardTrigger asChild>
  //                         <Button variant="outline" size="sm">
  //                           Source {idx + 1}
  //                         </Button>
  //                       </HoverCardTrigger>
  //                       <HoverCardContent className="w-[350px] text-xs">
  //                         {source.text}
  //                       </HoverCardContent>
  //                     </HoverCard>
  //                   ))}
  //                 </div>
  //               )}

  return (
    <div className="bg-background flex h-[calc(100dvh-calc(var(--spacing)*16))] min-w-0 flex-col">
      <Messages
        chatId={id}
        status={status}
        // votes={votes}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        isReadonly={false}
        isArtifactVisible={false}
      />

      <form className="bg-background mx-auto flex w-full gap-2 px-4 pb-4 md:max-w-3xl md:pb-6">
        <MultimodalInput
          chatId={id}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          status={status}
          stop={stop}
          attachments={attachments}
          setAttachments={setAttachments}
          messages={messages}
          setMessages={setMessages}
          append={append}
        />
      </form>
    </div>
  );
}
