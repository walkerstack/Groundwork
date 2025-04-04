import type { Metadata } from "next";

import ApiKeysPage from "./page.client";

export const metadata: Metadata = {
  title: "API Keys",
};

export default function ApiKeysPageServer() {
  return <ApiKeysPage />;
}
