import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RoleSelector from "./role-selector";
import type { Role } from "@/lib/auth-types";

export const MemberCard = ({
  name,
  email,
  image,
  role,
  showRole,
  actions,
}: {
  name?: string;
  email: string;
  image?: string;
  role?: string;
  showRole?: boolean;
  actions?: React.ReactNode;
}) => {
  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src={image || undefined} className="object-cover" />
          <AvatarFallback>{name?.charAt(0) || email.charAt(0)}</AvatarFallback>
        </Avatar>

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
