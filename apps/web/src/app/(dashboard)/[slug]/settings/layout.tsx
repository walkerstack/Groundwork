import DashboardPageWrapper from "../dashboard-page-wrapper";
import { SettingsTabs } from "./settings-tabs";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardPageWrapper title="Settings" className="pt-0">
      <SettingsTabs />

      <div className="mt-8">{children}</div>
    </DashboardPageWrapper>
  );
}
