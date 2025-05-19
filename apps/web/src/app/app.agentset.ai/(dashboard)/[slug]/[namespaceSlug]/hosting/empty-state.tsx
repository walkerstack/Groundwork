import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNamespace } from "@/contexts/namespace-context";
import { useTRPC } from "@/trpc/react";

import "@dnd-kit/core";

import type { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GlobeIcon, LockIcon, PaintbrushIcon } from "lucide-react";
import { toast } from "sonner";

import type { schema } from "./form";
import HostingForm from "./form";

export function EmptyState() {
  const { activeNamespace } = useNamespace();
  const [isOpen, setIsOpen] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: enableHosting, isPending } = useMutation(
    trpc.hosting.enable.mutationOptions({
      onSuccess: (hosting) => {
        toast.success("Hosting enabled successfully");
        setIsOpen(false);

        queryClient.setQueryData(
          trpc.hosting.get.queryKey({ namespaceId: activeNamespace.id }),
          { ...hosting, domain: null },
        );
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const handleSubmit = (data: z.infer<typeof schema>) => {
    enableHosting({
      namespaceId: activeNamespace.id,
      protected: data.protected,
      systemPrompt: data.systemPrompt,
      welcomeMessage: data.welcomeMessage,
      examples: data.examples,
    });
  };

  return (
    <div className="border-border w-full rounded-md border px-12 pt-24 pb-12">
      <div className="relative">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-semibold"> Host Your AI Assistant</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Deploy your AI assistant to a custom domain and share it with your
            users
          </p>
        </div>

        <div className="mt-5 flex justify-center">
          <Dialog
            open={isOpen}
            onOpenChange={(newOpen) => {
              if (!newOpen && isPending) return;
              setIsOpen(newOpen);
            }}
          >
            <DialogTrigger asChild>
              <Button size="lg">Enable</Button>
            </DialogTrigger>

            <DialogContent
              className="relative! top-0 left-0 translate-none!"
              overlayProps={{
                className: "grid place-items-center overflow-y-auto py-20",
              }}
            >
              <DialogHeader>
                <DialogTitle>Enable Hosting</DialogTitle>
              </DialogHeader>

              <div className="mt-6">
                <HostingForm
                  isPending={isPending}
                  onSubmit={handleSubmit}
                  action="Enable"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <GlobeIcon className="text-muted-foreground size-6" />
              <CardTitle className="mt-3">Custom Domain</CardTitle>
              <CardDescription>
                Deploy your AI assistant to your own domain
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <LockIcon className="text-muted-foreground size-6" />
              <CardTitle className="mt-3">Authentication</CardTitle>
              <CardDescription>
                Optional user authentication and access control
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <PaintbrushIcon className="text-muted-foreground size-6" />
              <CardTitle className="mt-3">Custom Branding</CardTitle>
              <CardDescription>
                Maintain your brand identity with custom styling
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
