import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const InvitationStatus = ({
  icon: Icon,
  iconContainerClassName,
  iconClassName,
  title,
  description,
}: {
  icon: React.ElementType;
  iconContainerClassName?: string;
  iconClassName?: string;
  title: string;
  description: string;
}) => {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardContent>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className={cn("rounded-full p-3", iconContainerClassName)}>
            <Icon className={cn("h-8 w-8", iconClassName)} />
          </div>

          <h3 className="mt-6 text-xl font-medium">{title}</h3>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};
