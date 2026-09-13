import { useQuery } from "@tanstack/react-query";

import { countShops } from "@/services/apiShops";
import { shopsKeys } from "@/features/shops/queryKeyFactory";

export function usePlacesCount(validated) {
  const filters = [{ field: "validated", value: validated }];
  const {
    isPending,
    data: count = 0,
    error,
  } = useQuery({
    queryKey: shopsKeys.count(filters),
    queryFn: () => countShops(filters),
  });

  return { isPending, error, count };
}
