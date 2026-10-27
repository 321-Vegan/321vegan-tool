import { useQuery } from "@tanstack/react-query";

import { getUserBrief } from "@/services/apiUsers";
import { usersKeys } from "./queryKeyFactory";

// Cached by user: the same author shows on many items to moderate.
export function useUserBrief(id) {
  const {
    isPending,
    data: user,
    error,
  } = useQuery({
    queryKey: usersKeys.brief(id),
    queryFn: () => getUserBrief(id),
    enabled: id != null,
    staleTime: 5 * 60 * 1000,
  });

  return { isPending: id != null && isPending, user, error };
}
