import type { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function IngestConfig({
  form,
}: {
  form: UseFormReturn<any, any, any>;
}) {
  const [metadata, setMetadata] = useState<string>("");

  return (
    <>
      <Separator />
      <FormField
        control={form.control}
        name="chunkSize"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Chunk size (optional)</FormLabel>
            <FormControl>
              <Input placeholder="512" {...field} />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="chunkOverlap"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Chunk overlap (optional)</FormLabel>
            <FormControl>
              <Input placeholder="32" {...field} />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="metadata"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Metadata (optional)</FormLabel>
            <FormControl>
              <Textarea
                value={metadata}
                onChange={(e) => {
                  const str = e.target.value;
                  setMetadata(str);
                  if (str === "") {
                    field.onChange(undefined);
                    return;
                  }

                  try {
                    field.onChange(JSON.parse(str));
                  } catch (error) {
                    field.onChange("");
                  }
                }}
                placeholder='{ "foo": "bar" }'
                className="h-24"
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
