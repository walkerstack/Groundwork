import { CreateOrgForm } from "./create-org-form";

export default function CreateOrganizationPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <CreateOrgForm />
      </div>
    </div>
  );
}
