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
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  return {
    session,
    refetch,
    isLoading,
  };
}
