import DashboardPageWrapper from "@/components/dashboard-page-wrapper";

import Chat from "./chat";
import ChatActions from "./chat-actions";

export default function PlaygroundPage() {
  return (
    <DashboardPageWrapper
      title="Playground"
      className="p-0"
      actions={<ChatActions />}
    >
      <Chat />
    </DashboardPageWrapper>
  );
}
