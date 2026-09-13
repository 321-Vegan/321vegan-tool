import { useQuery } from "@tanstack/react-query";

import { getSearchShops } from "@/services/apiShops";
import { shopsKeys } from "./queryKeyFactory";

// Same reasoning as the product validator: 100 unvalidated shops per session
// is already plenty, and keeps the search endpoint within its limits.
const VALIDATOR_PAGE_SIZE = 100;

export function useShopsToValidate() {
  const filters = [{ field: "validated", value: false }];
  const sortBy = "created_at-asc";

  const {
    isPending,
    data: { data: shops, count: totalCount } = {},
    error,
  } = useQuery({
    queryKey: shopsKeys.list(filters, sortBy, 1, VALIDATOR_PAGE_SIZE),
    queryFn: () =>
      getSearchShops({ filters, sortBy, page: 1, size: VALIDATOR_PAGE_SIZE }),
  });

  return { isPending, error, shops: shops || [], totalCount };
}
