import { useQuery } from "@tanstack/react-query";

import { getSearchRestaurants } from "@/services/apiRestaurants";
import { restaurantsKeys } from "./queryKeyFactory";

// Same as the shop validator: 100 pending restaurants per session is plenty.
const VALIDATOR_PAGE_SIZE = 100;

export function useRestaurantsToValidate() {
  const filters = [{ field: "validated", value: false }];
  const sortBy = "created_at-asc";

  const {
    isPending,
    data: { data: restaurants, count: totalCount } = {},
    error,
  } = useQuery({
    queryKey: restaurantsKeys.list(filters, sortBy, 1, VALIDATOR_PAGE_SIZE),
    queryFn: () =>
      getSearchRestaurants({
        filters,
        sortBy,
        page: 1,
        size: VALIDATOR_PAGE_SIZE,
      }),
  });

  return { isPending, error, restaurants: restaurants || [], totalCount };
}
