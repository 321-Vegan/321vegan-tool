import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { PAGE_SIZE } from "@/utils/constants";
import { buildQueryFilters } from "@/utils/helpers";
import { getSearchProducts } from "@/services/apiProducts";

import { productsKeys } from "./queryKeyFactory";

const filterFields = [
  { field: "ean", value: null },
  { field: "name", operator: "__contains", value: null },
  { field: "status", value: null },
  { field: "product_type", value: null },
  { field: "state", value: null },
  { field: "brand", operator: "___name__lookalike", value: null },
];

export function useSearchProducts() {
  const [searchParams] = useSearchParams();

  // FILTERS
  const filters = buildQueryFilters(filterFields, searchParams);

  // SORT
  const sortBy = searchParams.get("sortBy") || "created_at-desc";

  // PAGINATION
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const size = !searchParams.get("size")
    ? PAGE_SIZE
    : Number(searchParams.get("size"));

  const {
    isPending,
    data: { data: products, count } = {},
    error,
  } = useQuery({
    queryKey: productsKeys.list(filters, sortBy, page, size),
    queryFn: () => getSearchProducts({ filters, sortBy, page, size }),
    placeholderData: keepPreviousData,
  });

  return { isPending, error, products, count };
}
