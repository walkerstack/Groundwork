"use client";

import { MultimodalInput } from "./chat-input";
import { Messages } from "./messages";
import { useNamespaceChat } from "./use-chat";

export default function Chat() {
  const {
    id,
    messages,
    setMessages,
    status,
    input,
    setInput,
    handleSubmit,
    stop,
    reload,
  } = useNamespaceChat();

  return (
    <div className="bg-background flex h-[calc(100dvh-calc(var(--spacing)*20))] min-w-0 flex-col">
      <Messages
        chatId={id}
        status={status}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        isReadonly={false}
        isArtifactVisible={false}
      />

      <form className="bg-background mx-auto flex w-full gap-2 px-4 pb-4 md:max-w-3xl md:pb-6">
        <MultimodalInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          status={status}
          stop={stop}
          setMessages={setMessages}
        />
      </form>
    </div>
  );
}
