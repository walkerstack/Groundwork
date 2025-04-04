"use client";

import { useTransition } from "react";
import { useParams, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "@bprogress/next/app";

const items = [
  {
    title: "General",
    url: "/",
  },
  {
    title: "API Keys",
    url: "/api-keys",
  },
  {
    title: "Team",
    url: "/team",
  },
  {
    title: "Danger",
    url: "/danger",
  },
];

export function SettingsTabs() {
  const pathname = usePathname();
  const { slug } = useParams();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const final = items.map((item) => ({
    ...item,
    url: `/${slug}/settings${item.url === "/" ? "" : item.url}`,
  }));

  const onChange = (value: string) => {
    const item = final.find((item) => item.title === value);
    if (item) {
      startTransition(() => {
        router.push(item.url);
      });
    }
  };

  const active = final.find((item) => item.url === pathname);

  return (
    <Tabs onValueChange={onChange} value={active?.title}>
      <TabsList>
        {final.map((item) => (
          <TabsTrigger
            key={item.title}
            value={item.title}
            disabled={isPending}
            className="px-4"
          >
            {item.title}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
