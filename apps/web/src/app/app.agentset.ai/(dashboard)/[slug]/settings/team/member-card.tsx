import type { Role } from "@/lib/auth-types";
import { EntityAvatar } from "@/components/ui/avatar";

import RoleSelector from "./role-selector";

export const MemberCard = ({
  id,
  name,
  email,
  image,
  role,
  showRole,
  actions,
}: {
  id: string;
  name?: string;
  email: string;
  image?: string | null;
  role?: string | null;
  showRole?: boolean;
  actions?: React.ReactNode;
}) => {
  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex items-center space-x-4">
        <EntityAvatar
          className="size-9"
          fallbackClassName="bg-muted text-foreground"
          entity={{
            id,
            name,
            logo: image,
          }}
        />

        <div>
          {name ? (
            <>
              <p className="text-sm leading-none font-medium">{name}</p>
              <p className="text-muted-foreground text-sm">{email}</p>
            </>
          ) : (
            <p className="text-sm leading-none font-medium">{email}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {role && (
          <RoleSelector
            disabled={!showRole}
            role={role as Role}
            setRole={() => {}}
          />
        )}
        {actions}
      </div>
    </div>
  );
};
