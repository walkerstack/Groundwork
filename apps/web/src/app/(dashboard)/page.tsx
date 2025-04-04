import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardRootPage() {
  const allHeaders = await headers();
  const [organizations, defaultOrganization] = await Promise.all([
    auth.api
      .listOrganizations({
        headers: allHeaders,
      })
      .catch(() => null),
    auth.api
      .getFullOrganization({
        headers: allHeaders,
      })
      .catch(() => null),
  ]);

  if (!organizations || organizations.length === 0) {
    redirect("/create-organization");
  }

  const org = (defaultOrganization ?? organizations[0])!;
  redirect(`/${org.slug}`);

  return <div>SHOULD BE REDIRECTED</div>;
}
