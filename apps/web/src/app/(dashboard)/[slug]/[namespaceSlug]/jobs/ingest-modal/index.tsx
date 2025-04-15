"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOrganization } from "@/contexts/organization-context";
import { api } from "@/trpc/react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import TextForm from "./text-form";
import UploadForm from "./upload-form";
import UrlsForm from "./urls-form";

export function IngestModal() {
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();
  const { activeOrganization } = useOrganization();

  const onSuccess = () => {
    setIsOpen(false);
    void utils.ingestJob.all.invalidate();
  };

  const onTextSuccess = () => {
    onSuccess();
    toast.success("Text ingestion job created");
  };

  const onUploadSuccess = () => {
    onSuccess();
    toast.success("Upload ingestion job created");
  };

  const onUrlSuccess = () => {
    onSuccess();
    toast.success("URL ingestion job created");
  };

  const isPending = utils.ingestJob.ingest.isMutating() > 0;

  const isOverLimit =
    activeOrganization.totalPages >= activeOrganization.pagesLimit;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(newOpen) => {
        if (isPending) return;
        if (newOpen && isOverLimit) return;
        setIsOpen(newOpen);
      }}
    >
      <div>
        <DialogTrigger asChild>
          {isOverLimit ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button disabled>
                    <PlusIcon className="mr-2 h-4 w-4" /> Ingest content
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>You've reached your plan's limits. Upgrade to ingest more</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" /> Ingest content
            </Button>
          )}
        </DialogTrigger>
      </div>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ingest content</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="text" className="flex-1">
              Text
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex-1">
              Upload
            </TabsTrigger>
            <TabsTrigger value="urls" className="flex-1">
              URLs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <TextForm onSuccess={onTextSuccess} />
          </TabsContent>

          <TabsContent value="upload">
            <UploadForm onSuccess={onUploadSuccess} />
          </TabsContent>

          <TabsContent value="urls">
            <UrlsForm onSuccess={onUrlSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
