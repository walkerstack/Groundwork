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
import { Textarea } from "@/components/ui/textarea";
import { useNamespace } from "@/contexts/namespace-context";
import { useTRPC } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().optional(),
  text: z.string().min(10, "Text must be at least 10 characters"),
});

export default function TextForm({ onSuccess }: { onSuccess: () => void }) {
  const { activeNamespace } = useNamespace();
  const trpc = useTRPC();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const { mutateAsync, isPending } = useMutation(
    trpc.ingestJob.ingest.mutationOptions({
      onSuccess,
    }),
  );

  const handleTextSubmit = async (data: z.infer<typeof schema>) => {
    await mutateAsync({
      namespaceId: activeNamespace.id,
      payload: {
        type: "TEXT",
        name: data.name,
        text: data.text,
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleTextSubmit)}>
        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
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
          </div>

          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text</FormLabel>
                  <FormControl>
                    <Textarea
                      id="text"
                      placeholder="Enter your text here"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" isLoading={isPending}>
            Ingest Text
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
