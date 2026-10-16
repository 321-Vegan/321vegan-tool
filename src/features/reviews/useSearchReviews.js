import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { PAGE_SIZE } from "@/utils/constants";
import { buildQueryFilters } from "@/utils/helpers";
import { getSearchReviews } from "@/services/apiReviews";

import { reviewsKeys } from "./queryKeyFactory";

export function useSearchReviews(resource, subject, defaultStatus) {
  const [searchParams] = useSearchParams();

  // FILTERS
  const filterFields = [
    { field: "user", operator: "___nickname__contains", value: null },
    { field: "comment", operator: "__contains", value: null },
    { field: "rating", value: null },
    { field: "status", value: null, defaultValue: defaultStatus },
  ];
  const subjectValue = searchParams.get(subject.filterField);
  const filters = [
    ...buildQueryFilters(filterFields, searchParams),
    ...(subjectValue ? [subject.toFilter(subjectValue)] : []),
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
    data: { data: reviews, count } = {},
    error,
  } = useQuery({
    queryKey: reviewsKeys.list(resource, filters, sortBy, page, size),
    queryFn: () => getSearchReviews(resource, { filters, sortBy, page, size }),
    placeholderData: keepPreviousData,
  });

  return { isPending, error, reviews, count };
}
