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
