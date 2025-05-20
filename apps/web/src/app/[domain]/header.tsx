"use client";

import { useHostingChat } from "@/components/chat/use-hosting-chat";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default function Header({ title }: { title: string }) {
  const { setMessages } = useHostingChat();

  const resetChat = () => {
    setMessages([]);
  };

  return (
    <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button variant="outline" onClick={resetChat}>
        <PlusIcon className="size-4" />
        New Chat
      </Button>
    </div>
  );
}
