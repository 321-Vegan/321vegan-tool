import { useQuery } from "@tanstack/react-query";

import { getSearchProducts } from "@/services/apiProducts";
import { productsKeys } from "./queryKeyFactory";

// We get 100 products only because more would cause issue on backend side due to limitations of the search endpoint.
// 100 products to validate for a single session is already a lot for the contributor anyway !
const VALIDATOR_PAGE_SIZE = 100;

export function useValidatorProducts(
  statuses,
  enabled = false,
  state = "CREATED",
) {
  const filters = [{ field: "state", value: state }];
  const sortBy = "created_at-asc";

  const {
    isPending,
    data: { data: allProducts, count: totalCount } = {},
    error,
  } = useQuery({
    queryKey: productsKeys.list(filters, sortBy, 1, VALIDATOR_PAGE_SIZE),
    queryFn: () =>
      getSearchProducts({
        filters,
        sortBy,
        page: 1,
        size: VALIDATOR_PAGE_SIZE,
      }),
    enabled,
  });

  const products =
    statuses.length > 0
      ? allProducts?.filter((p) => statuses.includes(p.status)) || []
      : allProducts || [];

  return { isPending, error, products, count: products.length, totalCount };
}
