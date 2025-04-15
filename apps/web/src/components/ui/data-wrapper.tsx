// This is a wrapper component that is used to wrap async data and render a loading state, empty state, or error state.
import type { ReactNode } from "react";
import { Loader2Icon } from "lucide-react";

export function DataWrapper<T>({
  data,
  isLoading,
  error,
  loadingState,
  emptyState,
  errorState,
  children,
}: {
  data: T[] | undefined;
  isLoading?: boolean;
  error?: { message: string } | any;
  loadingState?: ReactNode;
  emptyState?: ReactNode;
  errorState?: ReactNode;
  children: (data: T[]) => ReactNode;
}) {
  if (error)
    return errorState || <div>{error.message || "An error occurred"}</div>;

  if (isLoading || !data)
    return loadingState || <Loader2Icon className="size-4 animate-spin" />;

  if (data.length === 0 && emptyState) return emptyState;

  return children(data);
}
