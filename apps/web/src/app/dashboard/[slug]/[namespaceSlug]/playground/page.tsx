import DashboardPageWrapper from "../../dashboard-page-wrapper";
import Chat from "./chat";

export default function PlaygroundPage() {
  return (
    <DashboardPageWrapper title="Playground" className="p-0">
      <Chat />
    </DashboardPageWrapper>
  );
}
