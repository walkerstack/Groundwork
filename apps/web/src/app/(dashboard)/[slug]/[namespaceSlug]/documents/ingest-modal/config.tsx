import type { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { SettingsIcon } from "lucide-react";

export default function IngestConfig({
  form,
}: {
  form: UseFormReturn<any, any, any>;
}) {
  const [metadata, setMetadata] = useState<string>("");

  return (
    <>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="hover:bg-muted/70 items-center justify-start duration-75 hover:no-underline">
            <SettingsIcon className="size-4" /> Chunking Settings
          </AccordionTrigger>
          <AccordionContent className="mt-6 flex flex-col gap-6">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
