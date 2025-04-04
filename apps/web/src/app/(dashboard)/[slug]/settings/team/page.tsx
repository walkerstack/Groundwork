import type { Metadata } from "next";

import TeamSettingsPage from "./page.client";

export const metadata: Metadata = {
  title: "Team",
};

export default function TeamSettingsPageServer() {
  return <TeamSettingsPage />;
}
