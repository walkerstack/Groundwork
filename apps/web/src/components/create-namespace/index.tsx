"use client";

import { useEffect } from "react";
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
import { toSlug } from "@/lib/slug";
import { trpcClient, useTRPC } from "@/trpc/react";
import { useRouter } from "@bprogress/next/app";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import AnthropicIcon from "../icons/anthropic";
import MicrosoftAzureIcon from "../icons/azure";
import OpenAIIcon from "../icons/openai";
import PineconeIcon from "../icons/pinecone";
import PostgreSQLIcon from "../icons/postgres";
import UpstashIcon from "../icons/upstash";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";

const embeddingModels = [
  {
    value: "azure",
    label: "Azure",
    icon: MicrosoftAzureIcon,
    models: [
      {
        value: "text-embedding-3-large",
        label: "text-embedding-3-large",
      },
      {
        value: "text-embedding-3-small",
        label: "text-embedding-3-small",
      },
    ],
  },
  {
    value: "openai",
    label: "OpenAI",
    icon: OpenAIIcon,
    models: [
      {
        value: "text-embedding-3-large",
        label: "text-embedding-3-large",
      },
      {
        value: "text-embedding-3-small",
        label: "text-embedding-3-small",
      },
    ],
  },
  {
    value: "anthropic",
    label: "Anthropic",
    icon: AnthropicIcon,
    models: [
      {
        value: "voyage-3-large",
        label: "voyage-3-large",
      },
      {
        value: "voyage-3",
        label: "voyage-3",
      },
      {
        value: "voyage-3-lite",
        label: "voyage-3-lite",
      },
      {
        value: "voyage-code-3",
        label: "voyage-code-3",
      },
      {
        value: "voyage-finance-2",
        label: "voyage-finance-2",
      },
      {
        value: "voyage-law-2",
        label: "voyage-law-2",
      },
    ],
  },
] as const;

const vectorStores = [
  {
    value: "pinecone",
    label: "Pinecone",
    icon: PineconeIcon,
  },
  {
    value: "upstash",
    label: "Upstash",
    comingSoon: true,
    icon: UpstashIcon,
  },
];

const formSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .refine(
      async (value) => {
        if (value === "") return false;
        const result = await trpcClient.namespace.checkSlug.query(value);
        return !result;
      },
      { message: "Slug is already taken" },
    ),
  embeddingModel: z.object({
    provider: z.enum(
      embeddingModels.map((model) => model.value) as [string, ...string[]],
    ),
    model: z.enum(
      embeddingModels
        .map((model) => model.models)
        .flat()
        .map((model) => model.value) as [string, ...string[]],
    ),
  }),
  vectorStore: z.enum(
    vectorStores.map((store) => store.value) as [string, ...string[]],
  ),
});

export default function CreateNamespaceForm({
  organization,
  onSuccess,
  isDialog = false,
}: {
  organization?: { id: string; slug: string } | null;
  onSuccess: () => void;
  isDialog?: boolean;
}) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema, undefined, { mode: "async" }),
    reValidateMode: "onBlur",
    defaultValues: {
      name: "",
      slug: "",
      embeddingModel: {
        provider: "azure",
        model: "text-embedding-3-large",
      },
      vectorStore: "pinecone",
    },
  });

  const { isPending, mutateAsync: createNamespace } = useMutation(
    trpc.namespace.createNamespace.mutationOptions({
      onSuccess: (data) => {
        toast.success("Namespace created");
        onSuccess();
        if (organization) {
          router.push(`/${organization.slug}/${data.slug}`);
        }

        void queryClient.invalidateQueries(trpc.organization.all.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const name = form.watch("name");
  const { formState, setValue } = form;
  useEffect(() => {
    if (!formState.touchedFields.slug) {
      setValue("slug", toSlug(name));
    }
  }, [name, formState, setValue]);

  // when the provider changes, set the model to the default model for the provider
  const provider = form.watch("embeddingModel.provider");
  useEffect(() => {
    if (provider) {
      const model = embeddingModels.find((p) => p.value === provider)?.models[0]
        .value;
      form.setValue("embeddingModel.model", model ?? "");
    }
  }, [provider, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (organization) {
      await createNamespace({
        orgId: organization.id,
        name: values.name,
        slug: values.slug,
      });
    }
  };

  const submitButton = (
    <Button type="submit" isLoading={isPending}>
      Create
    </Button>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Example" {...field} />
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
                  <Input placeholder="example" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          <div>
            <h3 className="font-medium">Embeddings</h3>

            <FormField
              control={form.control}
              name="embeddingModel.provider"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      {embeddingModels.map((provider) => (
                        <div key={provider.value}>
                          <RadioGroupItem
                            value={provider.value}
                            id={provider.value}
                            className="peer sr-only"
                            aria-label={provider.value}
                          />
                          <Label
                            htmlFor={provider.value}
                            className="border-muted hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between rounded-md border-2 bg-transparent p-4 text-black"
                          >
                            <provider.icon className="mb-3 h-6 w-6" />
                            {provider.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="embeddingModel.model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={field.value}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-xs">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>

                    <SelectContent>
                      {embeddingModels
                        .find(
                          (p) =>
                            p.value === form.watch("embeddingModel.provider"),
                        )
                        ?.models.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          <div>
            <h3 className="font-medium">Vector Store</h3>

            <FormField
              control={form.control}
              name="vectorStore"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      {vectorStores.map((store) => (
                        <div key={store.value} className="relative">
                          <RadioGroupItem
                            value={store.value}
                            id={store.value}
                            className="peer sr-only"
                            aria-label={store.value}
                            disabled={store.comingSoon}
                          />
                          <Label
                            htmlFor={store.value}
                            className="border-muted hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between rounded-md border-2 bg-transparent p-4 text-black"
                          >
                            <store.icon className="mb-3 h-6 w-6" />
                            {store.label}
                            {store.comingSoon && (
                              <span className="text-muted-foreground bg-background border-border absolute top-0 w-fit -translate-y-1/2 rounded-full border px-2 text-center text-xs">
                                Coming soon
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {isDialog ? (
          <DialogFooter className="mt-6">{submitButton}</DialogFooter>
        ) : (
          submitButton
        )}
      </form>
    </Form>
  );
}
