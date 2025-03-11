import { auth } from "@/lib/auth";
import DashboardPageWrapper from "../dashboard-page-wrapper";
import { headers } from "next/headers";
import EditUser from "./edit-user";
import ActiveSessions from "./active-sessions";

export default async function ProfilePage() {
  const allSessions = await auth.api.listSessions({
    headers: await headers(),
  });

  return (
    <DashboardPageWrapper title="Profile">
      <EditUser />

      <ActiveSessions activeSessions={allSessions} />
    </DashboardPageWrapper>
  );
}
