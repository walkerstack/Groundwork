import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { Role } from "@/lib/auth-types";

const roles = [
  {
    label: "Member",
    description: "Can view and comment.",
    value: "member",
  },
  {
    label: "Admin",
    description: "Can view, comment and manage billing.",
    value: "admin",
  },
  {
    label: "Owner",
    description: "Admin-level access to all resources.",
    value: "owner",
  },
];

export default function RoleSelector({
  role,
  setRole,
  disabled,
}: {
  role: Role;
  setRole: (role: Role) => void;
  disabled?: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button variant="outline" className="ml-auto">
          {roles.find((r) => r.value === role)?.label || "Role"}{" "}
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="end">
        <Command value={role} onValueChange={(value) => setRole(value as Role)}>
          <CommandInput placeholder="Select new role..." />
          <CommandList>
            <CommandEmpty>No roles found.</CommandEmpty>
            <CommandGroup>
              {roles.map((role) => (
                <CommandItem
                  key={role.value}
                  value={role.value}
                  className="flex flex-col items-start gap-0 px-4 py-2"
                >
                  <p>{role.label}</p>
                  <p className="text-muted-foreground text-sm">
                    {role.description}
                  </p>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
