import { CreateOrgForm } from "@/app/dashboard/create-organization/create-org-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

function CreateOrganizationDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogContent className="w-11/12 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to collaborate with your team.
            </DialogDescription>
          </DialogHeader>

          <CreateOrgForm
            isDialog
            onSuccess={() => {
              setOpen(false);
              toast.success("Organization created successfully");
            }}
          />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export default CreateOrganizationDialog;
