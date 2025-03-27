"use client";

import type { Attachment } from "ai";
import { useState } from "react";

import { MultimodalInput } from "./chat-input";
import { Messages } from "./messages";
import { useNamespaceChat } from "./use-chat";

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

  return (
    <div className="bg-background flex h-[calc(100dvh-calc(var(--spacing)*20))] min-w-0 flex-col">
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
