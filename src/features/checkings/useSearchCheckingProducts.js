import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { PAGE_SIZE } from "@/utils/constants";
import { buildQueryFilters } from "@/utils/helpers";
import { getSearchProducts } from "@/services/apiProducts";

import { productsKeys } from "@/features/products/queryKeyFactory";

const filterFields = [
  { field: "ean", value: null },
  { field: "name", operator: "__contains", value: null },
  { field: "status", value: null },
  { field: "state", operator: "__in", value: null },
  { field: "brand", operator: "___name__lookalike", value: null },
  { field: "checkings", operator: "___user___nickname__contains", value: null },
  { field: "last_requested_by", operator: "__contains", value: null },
  { field: "brand_contact", value: null },
];

export function useSearchCheckingProducts() {
  const [searchParams] = useSearchParams();

  // FILTERS
  const filters = buildQueryFilters(filterFields, searchParams);
  const index = filters.findIndex((obj) => obj.field === "state__in");
  if (index === -1) {
    filters.push({
      field: "state__in",
      value: "NEED_CONTACT,WAITING_BRAND_REPLY",
    });
  }

  // SORT
  const sortBy = searchParams.get("sortBy") || "requested_on-desc";

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
    queryKey: productsKeys.checking(filters, sortBy, page, size),
    queryFn: () => getSearchProducts({ filters, sortBy, page, size }),
    placeholderData: keepPreviousData,
  });

  return { isPending, error, products, count };
}
