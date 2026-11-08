import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { PAGE_SIZE } from "@/utils/constants";
import { buildQueryFilters } from "@/utils/helpers";
import { getSearchRestaurants } from "@/services/apiRestaurants";

import { restaurantsKeys } from "./queryKeyFactory";

const filterFields = [
  { field: "name", operator: "__lookalike", value: null },
  { field: "city", operator: "__lookalike", value: null },
  { field: "tags", value: null },
  { field: "vegan_status", value: null },
  { field: "operating_status", value: null },
];

// The "validated" param: the pending restaurants put aside with an issue
// are apart from the ones to validate
const VALIDATION_FILTERS = {
  1: [{ field: "validated", value: true }],
  0: [
    { field: "validated", value: false },
    { field: "validation_issue__isnull", value: true },
  ],
  aside: [
    { field: "validated", value: false },
    { field: "validation_issue__isnull", value: false },
  ],
};

export function useSearchRestaurants() {
  const [searchParams] = useSearchParams();

  // FILTERS
  const filters = [
    ...buildQueryFilters(filterFields, searchParams),
    ...(VALIDATION_FILTERS[searchParams.get("validated")] || []),
  ];

  // SORT
  const sortBy = searchParams.get("sortBy") || "created_at-desc";

  // PAGINATION
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const size = !searchParams.get("size")
    ? PAGE_SIZE
    : Number(searchParams.get("size"));

  const {
    isPending,
    data: { data: restaurants, count } = {},
    error,
  } = useQuery({
    queryKey: restaurantsKeys.list(filters, sortBy, page, size),
    queryFn: () => getSearchRestaurants({ filters, sortBy, page, size }),
    placeholderData: keepPreviousData,
  });

  return { isPending, error, restaurants, count };
}
