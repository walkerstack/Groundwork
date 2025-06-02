import type { DragEndEvent } from "@dnd-kit/core";
import React from "react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/prompts";
import { cn } from "@/lib/utils";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVerticalIcon, PlusIcon, XIcon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
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

// Virtual ID type for sortable items
type VirtualId = string;

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

  // Generate virtual IDs for each example
  const [virtualIds, setVirtualIds] = React.useState<VirtualId[]>(() =>
    form
      .getValues("examplesQuestions")
      .map((_, index) => `example-${index}-${Date.now()}`),
  );

  const [virtualIdsSearch, setVirtualIdsSearch] = React.useState<VirtualId[]>(
    () =>
      form
        .getValues("exampleSearchQueries")
        .map((_, index) => `example-${index}-${Date.now()}`),
  );

  const { fields, append, remove, move } = useFieldArray<
    FormValues,
    // @ts-expect-error - idk
    "example",
    "examplesQuestions"
  >({
    control: form.control,
    name: "examplesQuestions",
  });

  const {
    fields: fieldsSearch,
    append: appendSearch,
    remove: removeSearch,
    move: moveSearch,
  } = useFieldArray<
    FormValues,
    // @ts-expect-error - idk
    "example",
    "exampleSearchQueries"
  >({
    control: form.control,
    name: "exampleSearchQueries",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleAddExample = () => {
    // Check if the last example is empty
    const examplesQuestions = form.getValues("examplesQuestions");
    const lastExample = examplesQuestions.at(-1);
    if (lastExample === "") {
      form.setError(`examplesQuestions.${examplesQuestions.length - 1}`, {
        type: "manual",
        message: "Please fill in the current example before adding a new one",
      });
      return;
    }

    // Add new virtual ID when adding an example
    append("");
    setVirtualIds((prev) => [...prev, `example-${prev.length}-${Date.now()}`]);
  };

  const handleAddExampleSearch = () => {
    // Check if the last example is empty
    const exampleSearchQueries = form.getValues("exampleSearchQueries");
    const lastExample = exampleSearchQueries.at(-1);
    if (lastExample === "") {
      form.setError(`exampleSearchQueries.${exampleSearchQueries.length - 1}`, {
        type: "manual",
        message: "Please fill in the current example before adding a new one",
      });
    }

    // Add new virtual ID when adding an example
    appendSearch("");
    setVirtualIdsSearch((prev) => [
      ...prev,
      `example-${prev.length}-${Date.now()}`,
    ]);
  };

  const handleRemoveExample = (index: number) => {
    // Remove virtual ID when removing an example
    setVirtualIds((prev) => prev.filter((_, i) => i !== index));
    remove(index);
  };

  const handleRemoveExampleSearch = (index: number) => {
    // Remove virtual ID when removing an example
    setVirtualIdsSearch((prev) => prev.filter((_, i) => i !== index));
    removeSearch(index);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((_, i) => virtualIds[i] === active.id);
      const newIndex = fields.findIndex((_, i) => virtualIds[i] === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
        // Update virtual IDs order
        setVirtualIds((prev) => {
          const newIds = [...prev];
          const [movedId] = newIds.splice(oldIndex, 1);
          newIds.splice(newIndex, 0, movedId!);
          return newIds;
        });
      }
    }
  };

  const handleDragEndSearch = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fieldsSearch.findIndex(
        (_, i) => virtualIdsSearch[i] === active.id,
      );
      const newIndex = fieldsSearch.findIndex(
        (_, i) => virtualIdsSearch[i] === over.id,
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        moveSearch(oldIndex, newIndex);
        // Update virtual IDs order
        setVirtualIdsSearch((prev) => {
          const newIds = [...prev];
          const [movedId] = newIds.splice(oldIndex, 1);
          newIds.splice(newIndex, 0, movedId!);
          return newIds;
        });
      }
    }
  };

  return (
    <div>
      <Form {...form}>
        <form
          className="flex flex-col gap-8"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="protected"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-5">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Protected Access</FormLabel>
                  <FormDescription>
                    Only allow authenticated users to access your AI assistant
                  </FormDescription>
                </div>

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
                    <FormLabel>Allowed Emails</FormLabel>
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
                    <FormDescription>
                      Only these emails will be allowed access (if set).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allowedEmailDomains"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allowed Email Domains</FormLabel>
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
                    <FormDescription>
                      Only these email domains will be allowed access (if set).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

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
                  Optional path to use for citation names. For example, if your
                  metadata has a "title" field, enter "title". For nested
                  fields, use dot notation like "foo.bar".
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <FormLabel>Examples (Chat)</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddExample}
                disabled={fields.length >= 4}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Example
              </Button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={virtualIds}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((_, index) => {
                  const virtualId = virtualIds[index];
                  if (!virtualId) return null;

                  return (
                    <FormField
                      key={virtualId}
                      name={`examplesQuestions.${index}`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <SortableItem
                            id={virtualId}
                            inputProps={field}
                            onRemove={() => handleRemoveExample(index)}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <FormLabel>Examples (Search)</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddExampleSearch}
                disabled={fieldsSearch.length >= 4}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Example
              </Button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEndSearch}
            >
              <SortableContext
                items={virtualIdsSearch}
                strategy={verticalListSortingStrategy}
              >
                {fieldsSearch.map((_, index) => {
                  const virtualId = virtualIdsSearch[index];
                  if (!virtualId) return null;

                  return (
                    <FormField
                      key={virtualId}
                      name={`exampleSearchQueries.${index}`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <SortableItem
                            id={virtualId}
                            inputProps={field}
                            onRemove={() => handleRemoveExampleSearch(index)}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>
          </div>

          <FormMessage />

          <div className="flex justify-end space-x-4">
            <Button type="submit" isLoading={isPending}>
              {action}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function SortableItem({
  id,
  inputProps,
  onRemove,
}: {
  id: string;
  onRemove: () => void;
  inputProps?: React.ComponentProps<typeof Input>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border p-2",
        isDragging ? "bg-accent shadow-lg" : "",
      )}
    >
      <div
        className="cursor-grab touch-none"
        ref={setNodeRef}
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="text-muted-foreground h-4 w-4" />
      </div>

      <FormControl>
        <Input
          placeholder="Enter an example..."
          className="flex-1"
          {...inputProps}
        />
      </FormControl>

      <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
        <XIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
