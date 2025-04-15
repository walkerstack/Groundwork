import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export function useSession() {
  const {
    data: session,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession().then((res) => res.data),
  });

  return {
    session,
    refetch,
    isLoading,
  };
}
