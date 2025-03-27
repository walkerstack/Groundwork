import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useNamespaceChat } from "./use-chat";

export default function ChatForm() {
  const { input, handleSubmit, handleInputChange, status } = useNamespaceChat();

  return (
    <form className="border-border flex border-t" onSubmit={handleSubmit}>
      <Input
        placeholder="Ask a question..."
        className="rounded-none"
        value={input}
        onChange={handleInputChange}
      />

      <Button
        type="submit"
        className="rounded-none"
        isLoading={status === "submitted" || status === "streaming"}
      >
        Send
      </Button>
    </form>
  );
}
