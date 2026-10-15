import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { getShopsInArea } from "@/services/apiShops";
import { shopsKeys } from "./queryKeyFactory";

// bounds is null until the map has reported its visible area.
export function useShopsInArea(bounds) {
  const {
    isPending,
    data: shops = [],
    error,
  } = useQuery({
    queryKey: shopsKeys.inArea(bounds),
    queryFn: () => getShopsInArea(bounds),
    enabled: bounds !== null,
    placeholderData: keepPreviousData,
  });

  return { isPending, error, shops };
}
