import React from "react";
import SortableList from "@/components/sortable-list";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/prompts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

type FormData = z.infer<typeof schema>;

export const schema = z.object({
  protected: z.boolean(),
  allowedEmails: z.array(z.string().email()).optional(),
  allowedEmailDomains: z.array(z.string()).optional(),
  systemPrompt: z.string().min(1, "System prompt cannot be empty"),
  examplesQuestions: z
    .array(z.string().min(1, "Example cannot be empty"))
    .max(4),
  exampleSearchQueries: z
    .array(z.string().min(1, "Example cannot be empty"))
    .max(4),
  welcomeMessage: z.string(),
  citationMetadataPath: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function HostingForm({
  isPending,
  onSubmit,
  action = "Submit",
  defaultValues,
}: {
  isPending: boolean;
  onSubmit: (data: FormData) => void;
  action?: string;
  defaultValues?: Partial<FormData>;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      protected: false,
      allowedEmails: [],
      allowedEmailDomains: [],
      systemPrompt: DEFAULT_SYSTEM_PROMPT.compile(),
      examplesQuestions: [],
      exampleSearchQueries: [],
      welcomeMessage: "",
      citationMetadataPath: "",
      ...defaultValues,
    },
  });

  return (
    <div>
      <Form {...form}>
        <form
          className="flex flex-col gap-20"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div>
            <div>
              <h2 className="text-xl font-medium">Protection</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Only allow certain people to access your hosting
              </p>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col gap-8">
              <FormField
                control={form.control}
                name="protected"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormLabel>Enabled</FormLabel>

                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("protected") && (
                <>
                  <FormField
                    control={form.control}
                    name="allowedEmails"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col gap-1">
                          <FormLabel>Allowed Emails</FormLabel>
                          <FormDescription>
                            Only these emails will be allowed access (if set).
                          </FormDescription>
                        </div>

                        <FormControl>
                          <Textarea
                            placeholder="Enter allowed emails, one per line"
                            value={field.value?.join("\n") || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  .split("\n")
                                  .map((v) => v.trim())
                                  .filter(Boolean),
                              )
                            }
                            className="h-24 max-h-40"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowedEmailDomains"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col gap-1">
                          <FormLabel>Allowed Email Domains</FormLabel>
                          <FormDescription>
                            Only these email domains will be allowed access (if
                            set).
                          </FormDescription>
                        </div>

                        <FormControl>
                          <Textarea
                            placeholder="Enter allowed domains, one per line (e.g. example.com)"
                            value={field.value?.join("\n") || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  .split("\n")
                                  .map((v) => v.trim())
                                  .filter(Boolean),
                              )
                            }
                            className="h-24 max-h-40"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          </div>

          <div>
            <div>
              <h2 className="text-xl font-medium">Chat Settings</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Customize the chat settings for your hosting
              </p>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col gap-8">
              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        id="systemPrompt"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-32 max-h-56"
                        placeholder="Enter your system prompt..."
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="welcomeMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Welcome Message</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="h-32 max-h-56"
                        placeholder="Enter a welcome message that will be shown to users when they first interact with your AI assistant..."
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="citationMetadataPath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Citation Metadata Path</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. title or foo.bar"
                        className="max-w-sm"
                      />
                    </FormControl>
                    <FormDescription>
                      Optional path to use for citation names. For example, if
                      your metadata has a "title" field, enter "title". For
                      nested fields, use dot notation like "foo.bar".
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SortableList
                form={form}
                name="examplesQuestions"
                label="Examples"
                maxItems={4}
              />
            </div>
          </div>

          <div>
            <div>
              <h2 className="text-xl font-medium">Search Settings</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Customize the search settings for your hosting
              </p>
            </div>

            <Separator className="my-4" />

            <SortableList
              form={form}
              name="exampleSearchQueries"
              label="Examples"
              maxItems={4}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" isLoading={isPending}>
              {action}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
