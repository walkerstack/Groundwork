import AvatarUploader from "@/components/avatar-uploader";
import ListInput from "@/components/list-input";
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
import { APP_DOMAIN, HOSTING_PREFIX, SHORT_DOMAIN } from "@/lib/constants";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/prompts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Separate type for API submission
type FormSubmissionData = {
  title: string;
  slug: string;
  logo?: string | null;
  protected: boolean;
  allowedEmails: string[];
  allowedEmailDomains: string[];
  systemPrompt: string;
  examplesQuestions: string[];
  exampleSearchQueries: string[];
  welcomeMessage: string;
  citationMetadataPath?: string;
};

export const schema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  logo: z.string().nullable().optional(),
  protected: z.boolean(),
  allowedEmails: z.array(z.string().email()),
  allowedEmailDomains: z.array(z.string()),
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
  onSubmit: (data: FormSubmissionData) => void;
  action?: string;
  defaultValues?: Partial<FormSubmissionData>;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      slug: "",
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

  const handleSubmit = async (data: FormValues) => {
    onSubmit({
      title: data.title,
      slug: data.slug,
      logo: defaultValues?.logo === data.logo ? undefined : data.logo,
      protected: data.protected,
      allowedEmails: data.allowedEmails,
      allowedEmailDomains: data.allowedEmailDomains,
      systemPrompt: data.systemPrompt,
      examplesQuestions: data.examplesQuestions,
      exampleSearchQueries: data.exampleSearchQueries,
      welcomeMessage: data.welcomeMessage,
      citationMetadataPath: data.citationMetadataPath,
    });
  };

  return (
    <div>
      <Form {...form}>
        <form
          className="flex flex-col gap-20"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <div>
            <div>
              <h2 className="text-xl font-medium">Basic Information</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Configure the basic information for your hosting
              </p>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col gap-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter a title for your hosting..."
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter a unique slug..." />
                    </FormControl>
                    <FormDescription>
                      Preview: {APP_DOMAIN}
                      {HOSTING_PREFIX}
                      {field.value}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo</FormLabel>

                    <AvatarUploader
                      onImageChange={field.onChange}
                      defaultImageUrl={defaultValues?.logo}
                    />

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

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
                  <ListInput
                    form={form}
                    name="allowedEmails"
                    label="Allowed Emails"
                    description="Only these emails will be allowed access (if set)."
                    placeholder="Enter an email address..."
                  />

                  <ListInput
                    form={form}
                    name="allowedEmailDomains"
                    label="Allowed Email Domains"
                    description="Only these email domains will be allowed access (if set)."
                    placeholder="Enter a domain (e.g. example.com)..."
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
                        {...field}
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
