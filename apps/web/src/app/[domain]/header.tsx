"use client";

import { useHostingChat } from "@/components/chat/use-hosting-chat";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default function Header() {
  const { setMessages } = useHostingChat();

  const resetChat = () => {
    setMessages([]);
  };

  return (
    <div className="mx-auto flex h-16 w-full max-w-5xl items-center px-4">
      <Button variant="outline" onClick={resetChat}>
        <PlusIcon className="size-4" />
        New Chat
      </Button>
    </div>
  );
}
