"use client";

import { Button } from "@/components/ui/button";
import { Code2Icon, LogsIcon, PlusIcon } from "lucide-react";

import ChatSettings from "./chat-settings";
import { useNamespaceChat } from "./chat/use-chat";

export default function ChatActions() {
  const { setMessages } = useNamespaceChat();

  const resetChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={resetChat}>
        <PlusIcon className="size-4" />
        New Chat
      </Button>

      <ChatSettings />

      <Button variant="outline">
        <Code2Icon className="size-4" />
        API
      </Button>

      {/*
TODO: 
- 3 tabs
  1. query sent to the vector store
  2. list of returned chunks (before re-ranking)
  3. list of chunks after (re-ranking)
 */}
      <Button variant="outline">
        <LogsIcon className="size-4" />
        Logs
      </Button>
    </div>
  );
}
