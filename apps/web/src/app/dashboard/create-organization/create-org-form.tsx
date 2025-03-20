"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { toSlug } from "@/lib/slug";
import { cn } from "@/lib/utils";
import { useRouter } from "@bprogress/next/app";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .refine(
      async (value) => {
        const result = await authClient.organization.checkSlug({
          slug: value,
        });

        return !!result.data?.status;
      },
      { message: "Slug is already taken" },
    ),
});

export function CreateOrgForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema, undefined, { mode: "async" }),
    reValidateMode: "onBlur",
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const { mutateAsync: createOrganization, isPending: isCreatingOrganization } =
    useMutation({
      mutationFn: async ({ name, slug }: { name: string; slug: string }) => {
        const response = await authClient.organization.create({
          name,
          slug,
        });

        if (response.error || !response.data) {
          throw new Error(response.error.message);
        }

        return response.data;
      },
      onSuccess: (data) => {
        router.push(`/dashboard/${data.slug}`);
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to create organization");
      },
    });

  const name = form.watch("name");
  const { formState, setValue } = form;
  useEffect(() => {
    if (!formState.touchedFields.slug) {
      setValue("slug", toSlug(name));
    }
  }, [name, formState, setValue]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createOrganization(values);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-xl font-bold">Create your first organization</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Organization" {...field} />
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
                      <Input placeholder="my-organization" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isCreatingOrganization}
              >
                Create
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
