"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHostingChat } from "@/components/chat/use-hosting-chat";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon } from "lucide-react";

export default function Header({ title }: { title: string }) {
  const { setMessages } = useHostingChat();
  const path = usePathname();

  const isSearch = path === "/search";

  const resetChat = () => {
    setMessages([]);
  };

  return (
    <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <h2
          className="cursor-pointer text-lg font-semibold"
          onClick={resetChat}
        >
          {title}
        </h2>
      </div>
      <Tabs value={isSearch ? "search" : "chat"}>
        <TabsList>
          <TabsTrigger value="chat" asChild>
            <Link href="/">Chat</Link>
          </TabsTrigger>
          <TabsTrigger value="search" asChild>
            <Link href="/search">Search</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isSearch ? (
        <div className="h-9 w-28.5" />
      ) : (
        <Button variant="outline" onClick={resetChat}>
          <PlusIcon className="size-4" />
          New Chat
        </Button>
      )}
    </div>
  );
}
