import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

function CreateOrganizationDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    if (!isSlugEdited) {
      const generatedSlug = name.trim().toLowerCase().replace(/\s+/g, "-");
      setSlug(generatedSlug);
    }
  }, [name, isSlugEdited]);

  useEffect(() => {
    if (open) {
      setName("");
      setSlug("");
      setIsSlugEdited(false);
      setLogo(null);
    }
  }, [open]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    await authClient.organization.create(
      {
        name: name,
        slug: slug,
        logo: logo || undefined,
      },
      {
        onResponse: () => {
          setLoading(false);
        },
        onSuccess: () => {
          toast.success("Organization created successfully");
          setOpen(false);
        },
        onError: (error) => {
          toast.error(error.error.message);
          setLoading(false);
        },
      },
    );
  };

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
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>Organization Name</Label>
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Organization Slug</Label>
              <Input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsSlugEdited(true);
                }}
                placeholder="Slug"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Logo</Label>
              <Input type="file" accept="image/*" onChange={handleLogoChange} />
              {logo && (
                <div className="mt-2">
                  <Image
                    src={logo}
                    alt="Logo preview"
                    className="h-16 w-16 object-cover"
                    width={16}
                    height={16}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button isLoading={loading} onClick={handleCreate}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export default CreateOrganizationDialog;
