import { Spinner } from "@agentset/ui";

export default function LayoutLoader() {
  return (
    <div className="flex h-[calc(100vh-16px)] items-center justify-center">
      <Spinner />
    </div>
  );
}
