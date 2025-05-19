import Chat from "@/components/chat";
import DashboardPageWrapper from "@/components/dashboard-page-wrapper";

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
