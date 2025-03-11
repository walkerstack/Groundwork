import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRootPage() {
  const allHeaders = await headers();
  const organizations = await auth.api
    .listOrganizations({
      headers: allHeaders,
    })
    .catch(() => null);

  if (!organizations || organizations.length === 0) {
    redirect("/dashboard/create-organization");
  }

  redirect(`/dashboard/${organizations[0]!.slug}`);

  return <div>SHOULD BE REDIRECTED</div>;
}
