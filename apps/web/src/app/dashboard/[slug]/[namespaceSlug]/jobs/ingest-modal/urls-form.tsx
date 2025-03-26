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
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  urls: z
    .array(z.string().url("Please enter a valid URL"))
    .min(1, "Add at least one URL"),
});

export default function UrlsForm({ onSuccess }: { onSuccess: () => void }) {
  const { activeNamespace } = useNamespace();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      urls: [""],
    },
  });

  const { mutateAsync, isPending } = api.ingestJob.ingest.useMutation({
    onSuccess,
  });

  const handleUrlsSubmit = async (data: z.infer<typeof schema>) => {
    await mutateAsync({
      namespaceId: activeNamespace.id,
      payload: {
        type: "URLS",
        urls: data.urls,
      },
    });
  };

  const addUrlField = () => {
    const urls = form.getValues("urls");
    form.setValue("urls", [...urls, ""]);
  };

  const removeUrlField = (index: number) => {
    const urls = form.getValues("urls");
    if (urls.length > 1) {
      form.setValue(
        "urls",
        urls.filter((_, i) => i !== index),
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleUrlsSubmit)}>
        <div className="flex flex-col gap-1 py-4">
          {form.watch("urls").map((_, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name={`urls.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{index === 0 ? "URLs" : ""}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("urls").length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeUrlField(index)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="ghost"
            className="mt-4 w-fit"
            onClick={addUrlField}
          >
            Add URL
          </Button>
        </div>

        <DialogFooter>
          <Button type="submit" isLoading={isPending}>
            Ingest URLs
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
