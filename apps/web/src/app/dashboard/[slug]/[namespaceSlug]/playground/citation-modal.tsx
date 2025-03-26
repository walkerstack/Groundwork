import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CitationModalProps {
  trigger: React.ReactNode;
  sourceContent: string;
  sourceIndex: number;
}

export function CitationModal({
  trigger,
  sourceContent,
  sourceIndex,
}: CitationModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Source [{sourceIndex}]</DialogTitle>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          <p className="text-sm whitespace-pre-wrap">{sourceContent}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
