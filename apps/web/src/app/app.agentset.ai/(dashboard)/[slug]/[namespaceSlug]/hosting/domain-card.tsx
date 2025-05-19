import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNamespace } from "@/contexts/namespace-context";
import { SHORT_DOMAIN } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  LoaderCircleIcon,
  RefreshCwIcon,
  TrashIcon,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

const CNAME_VALUE = `cname.${SHORT_DOMAIN}`;
const A_VALUE = "76.76.21.21";

function DNSRecordDisplay({
  type,
  name,
  value,
  ttl,
}: {
  type: string;
  name: string;
  value: string;
  ttl?: string;
}) {
  return (
    <div className="bg-background flex max-w-[80vw] items-center justify-start space-x-10 overflow-x-scroll rounded-md border-2 p-4 font-mono md:max-w-full">
      <div>
        <p className="text-muted-foreground text-sm">Type</p>
        <p className="mt-2 text-sm">{type}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">Name</p>
        <p className="mt-2 text-sm">{name}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">Value</p>
        <p className="mt-2 text-sm">{value}</p>
      </div>
      {ttl && (
        <div>
          <p className="text-muted-foreground text-sm">TTL</p>
          <p className="mt-2 text-sm">{ttl}</p>
        </div>
      )}
    </div>
  );
}

export function useDomainStatus() {
  const trpc = useTRPC();
  const { activeNamespace } = useNamespace();
  const { data, isFetching, refetch } = useQuery(
    trpc.domain.checkStatus.queryOptions(
      { namespaceId: activeNamespace.id },
      {
        refetchInterval: 20000,
      },
    ),
  );

  return {
    status: data?.status,
    domainJson: data?.response.domainJson,
    loading: isFetching,
    refetch,
  };
}

const getSubdomain = (name: string, apexName: string) => {
  if (name === apexName) return null;
  return name.slice(0, name.length - apexName.length - 1);
};

const InlineSnippet = ({
  className,
  children,
}: {
  className?: string;
  children: string;
}) => {
  return (
    <span
      className={cn(
        "bg-primary-foreground inline-block rounded-md px-1 py-0.5 font-mono",
        className,
      )}
    >
      {children}
    </span>
  );
};

function DomainConfiguration(props: { domain: string }) {
  const { domain } = props;
  const { status, domainJson } = useDomainStatus();

  if (!status || status === "Valid Configuration" || !domainJson) return null;

  const subdomain = getSubdomain(domainJson.name, domainJson.apexName);

  const txtVerification =
    (status === "Pending Verification" &&
      domainJson.verification.find((x) => x.type === "TXT")) ||
    null;

  if (status === "Unknown Error") {
    return <p className="mb-5 text-sm">{domainJson.error?.message}</p>;
  }

  const selectedTab = txtVerification
    ? "txt"
    : domainJson.name === domainJson.apexName
      ? "apex"
      : "subdomain";

  return (
    <CardFooter className="mt-4 flex flex-grow justify-start">
      <Tabs value={selectedTab} className="w-full">
        <TabsList>
          <TabsTrigger value="txt">Domain Verification</TabsTrigger>
          <TabsTrigger value="subdomain">CNAME</TabsTrigger>
          <TabsTrigger value="apex">Apex</TabsTrigger>
        </TabsList>
        {txtVerification && (
          <TabsContent value="txt">
            <div className="flex flex-col gap-2 pt-4">
              <p className="text-muted-foreground text-sm">
                Please set the following TXT record on{" "}
                <InlineSnippet>{domainJson.apexName}</InlineSnippet> to prove
                ownership of <InlineSnippet>{domainJson.name}</InlineSnippet>:
              </p>
              <DNSRecordDisplay
                name={txtVerification.domain.slice(
                  0,
                  txtVerification.domain.length -
                    domainJson.apexName.length -
                    1,
                )}
                type={txtVerification.type}
                value={txtVerification.value}
              />
              <p className="text-muted-foreground text-xs">
                Warning: if you are using this domain for another site, setting
                this TXT record will transfer domain ownership away from that
                site and break it. Please exercise caution when setting this
                record.
              </p>
            </div>
          </TabsContent>
        )}
        <TabsContent value="subdomain">
          <div className="flex flex-col gap-4 pt-4">
            <span className="text-sm">
              To configure your subdomain{" "}
              <InlineSnippet>{domainJson.name}</InlineSnippet>, set the
              following CNAME record on your DNS provider to continue:
            </span>
            <DNSRecordDisplay
              type={"CNAME"}
              name={subdomain ?? "www"}
              value={CNAME_VALUE}
              ttl="86400"
            />
          </div>
        </TabsContent>
        <TabsContent value="apex">
          <div className="flex flex-col gap-4 pt-4">
            <span className="text-sm">
              To configure your domain{" "}
              <InlineSnippet>{domainJson.apexName}</InlineSnippet>, set the
              following A record on your DNS provider to continue:
            </span>
            <DNSRecordDisplay type="A" name="@" value={A_VALUE} ttl="86400" />
          </div>
        </TabsContent>
        {selectedTab !== "txt" && (
          <div className="my-3 text-left">
            <p className="mt-5 text-sm dark:text-white">
              Note: for TTL, if <InlineSnippet>86400</InlineSnippet> is not
              available, set the highest value possible. Also, domain
              propagation can take up to an hour.
            </p>
          </div>
        )}
      </Tabs>
    </CardFooter>
  );
}

function DomainStatus({ domain }: { domain: string }) {
  const { status } = useDomainStatus();

  if (status === "Valid Configuration") {
    return (
      <CheckCircle2Icon
        fill="#2563EB"
        stroke="currentColor"
        className="text-white dark:text-white"
      />
    );
  }
  if (status === "Pending Verification") {
    return (
      <AlertCircleIcon
        fill="#FBBF24"
        stroke="currentColor"
        className="text-white dark:text-black"
      />
    );
  }
  if (status === "Domain Not Found") {
    return (
      <XCircleIcon
        fill="#DC2626"
        stroke="currentColor"
        className="text-white dark:text-black"
      />
    );
  }
  if (status === "Invalid Configuration") {
    return (
      <XCircleIcon
        fill="#DC2626"
        stroke="currentColor"
        className="text-white dark:text-black"
      />
    );
  }
  return null;
}

const DomainControls = ({ domain }: { domain: string }) => {
  const { refetch, loading } = useDomainStatus();
  const { activeNamespace } = useNamespace();
  const trpc = useTRPC();
  const { mutate: removeDomain, isPending: isRemovingDomain } = useMutation(
    trpc.domain.remove.mutationOptions({
      onSuccess: () => {
        toast.success("Domain removed successfully");
      },
    }),
  );

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        isLoading={loading}
        type="button"
        onClick={() => refetch()}
      >
        <RefreshCwIcon className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        isLoading={isRemovingDomain}
        type="button"
        onClick={() => removeDomain({ namespaceId: activeNamespace.id })}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </>
  );
};

export function CustomDomainConfigurator(props: { defaultDomain?: string }) {
  const [domain, setDomain] = useState<string | null>(
    props.defaultDomain ?? null,
  );

  const [domainInput, setDomainInput] = useState<string>(
    props.defaultDomain ?? "",
  );

  const trpc = useTRPC();
  const { activeNamespace } = useNamespace();

  const { mutate: addDomain, isPending } = useMutation(
    trpc.domain.add.mutationOptions({
      onSuccess: (data) => {
        toast.success("Domain added successfully");
        setDomain(data.slug);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to add domain");
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!domainInput) return;
    addDomain({ domain: domainInput, namespaceId: activeNamespace.id });
  };

  return (
    <Card className="flex flex-col space-y-6">
      <form onSubmit={handleSubmit}>
        <CardHeader className="gap-0.5">
          <CardTitle className="text-lg font-semibold">Custom Domain</CardTitle>
          <CardDescription>The custom domain for your site.</CardDescription>
        </CardHeader>
        <CardContent className="bg-background relative mt-5 flex w-full flex-row items-center justify-between">
          <Input
            type="text"
            placeholder="example.com"
            maxLength={64}
            className="bg-background max-w-sm"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
          />

          <div className="flex items-center space-x-2">
            {domain ? (
              <>
                <DomainStatus domain={domain} />
                <DomainControls domain={domain} />
              </>
            ) : (
              <Button type="submit" variant="outline" isLoading={isPending}>
                Save
              </Button>
            )}
          </div>
        </CardContent>
        {domain && <DomainConfiguration domain={domain} />}
      </form>
    </Card>
  );
}
