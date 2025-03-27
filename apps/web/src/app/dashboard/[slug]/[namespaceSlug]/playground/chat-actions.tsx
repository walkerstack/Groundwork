"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

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
    </div>
  );
}
