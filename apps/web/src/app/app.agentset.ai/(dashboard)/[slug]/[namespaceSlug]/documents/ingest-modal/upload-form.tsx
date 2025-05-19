import { useEffect } from "react";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useNamespace } from "@/contexts/namespace-context";
import { useUploadFile } from "@/hooks/use-upload";
import { MAX_UPLOAD_SIZE } from "@/lib/upload";
import { useTRPC } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { configSchema } from "@agentset/validation";

import IngestConfig from "./config";

const schema = z
  .object({
    name: z.string().optional(),
    files: z
      .array(z.instanceof(File))
      .min(1, { message: "File is required" })
      .max(1),
  })
  .merge(configSchema);

export default function UploadForm({ onSuccess }: { onSuccess: () => void }) {
  const { activeNamespace } = useNamespace();
  const trpc = useTRPC();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      files: [],
    },
  });

  const files = form.watch("files");
  const { setValue } = form;
  useEffect(() => {
    if (files[0]?.name) {
      setValue("name", files[0].name);
    }
  }, [files, setValue]);

  const { onUpload, progresses, isUploading } = useUploadFile({
    namespaceId: activeNamespace.id,
  });

  const { mutateAsync, isPending: isFilePending } = useMutation(
    trpc.ingestJob.ingest.mutationOptions({
      onSuccess,
    }),
  );

  const handleFileSubmit = async (data: z.infer<typeof schema>) => {
    const uploadedFile = await onUpload(data.files[0]!);
    if (!uploadedFile) return;

    await mutateAsync({
      namespaceId: activeNamespace.id,
      payload: {
        type: "MANAGED_FILE",
        name: data.name ?? uploadedFile.name,
        key: uploadedFile.key,
      },
      config:
        data.chunkSize || data.chunkOverlap || data.metadata
          ? {
              chunkSize: data.chunkSize,
              chunkOverlap: data.chunkOverlap,
              metadata: data.metadata,
            }
          : undefined,
    });
  };

  const isPending = isFilePending || isUploading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFileSubmit)}>
        <div className="flex flex-col gap-6 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="example.txt" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="files"
            render={({ field }) => (
              <FormItem>
                <FormLabel>File</FormLabel>
                <FormControl>
                  <FileUploader
                    value={field.value}
                    onValueChange={field.onChange}
                    maxFileCount={1}
                    maxSize={MAX_UPLOAD_SIZE}
                    progresses={progresses}
                    accept={{}}
                    disabled={isPending}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <IngestConfig form={form} />
        </div>

        <DialogFooter>
          <Button type="submit" isLoading={isPending}>
            Ingest File
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
