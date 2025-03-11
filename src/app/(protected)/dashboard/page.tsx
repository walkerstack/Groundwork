import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRootPage() {
  const allHeaders = await headers();
  const organization = await auth.api
    .getFullOrganization({
      headers: allHeaders,
    })
    .catch(() => null);

  if (!organization) {
    redirect("/dashboard/create-organization");
  }

  redirect(`/dashboard/${organization.slug}`);

  return <div>SHOULD BE REDIRECTED</div>;
}
