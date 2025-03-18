"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNamespace } from "@/contexts/namespace-context";
import { api } from "@/trpc/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function IngestModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { activeNamespace } = useNamespace();

  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");

  const utils = api.useUtils();
  const { mutateAsync: ingestText, isPending: isTextPending } =
    api.ingestJob.ingestText.useMutation({
      onSuccess: () => {
        setIsOpen(false);
        toast.success("Text ingestion job created");
        void utils.ingestJob.all.invalidate();
      },
    });

  const { mutateAsync: ingestUrl, isPending: isUrlPending } =
    api.ingestJob.ingestFile.useMutation({
      onSuccess: () => {
        setIsOpen(false);
        toast.success("URL ingestion job created");
        void utils.ingestJob.all.invalidate();
      },
    });

  const handleTextSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !text) {
      toast.error("Please fill in all fields");
      return;
    }

    await ingestText({
      namespaceId: activeNamespace.id,
      name,
      text,
    });
  };

  const handleUrlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !url) {
      toast.error("Please fill in all fields");
      return;
    }

    await ingestUrl({
      namespaceId: activeNamespace.id,
      name,
      fileUrl: url,
    });
  };

  const isPending = isTextPending || isUrlPending;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(newOpen) => {
        if (isPending) return;
        setIsOpen(newOpen);
      }}
    >
      <div>
        <DialogTrigger asChild>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> Ingest content
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ingest content</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="text" className="flex-1">
              Text
            </TabsTrigger>
            <TabsTrigger value="url" className="flex-1">
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <form onSubmit={handleTextSubmit}>
              <div className="flex flex-col gap-6 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="text-name">Name</Label>
                  <Input
                    id="text-name"
                    placeholder="example.txt"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="text">Text</Label>
                  <Textarea
                    id="text"
                    placeholder="Enter your text here"
                    className="min-h-[200px]"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" isLoading={isTextPending}>
                  Ingest Text
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="url">
            <form onSubmit={handleUrlSubmit}>
              <div className="flex flex-col gap-6 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="url-name">Name</Label>
                  <Input
                    id="url-name"
                    placeholder="example-url"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" isLoading={isUrlPending}>
                  Ingest URL
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
