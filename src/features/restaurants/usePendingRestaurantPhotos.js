import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { PAGE_SIZE } from "@/utils/constants";
import { getSearchRestaurantPhotos } from "@/services/apiRestaurants";
import { restaurantsKeys } from "./queryKeyFactory";

export function usePendingRestaurantPhotos() {
  const [searchParams] = useSearchParams();

  const filters = [{ field: "status", value: "PENDING" }];
  const sortBy = "created_at-asc";
  // Same params as the Pagination component
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const size = !searchParams.get("size")
    ? PAGE_SIZE
    : Number(searchParams.get("size"));

  const {
    isPending,
    data: { data: photos, count } = {},
    error,
  } = useQuery({
    queryKey: restaurantsKeys.photoList(filters, sortBy, page, size),
    queryFn: () =>
      getSearchRestaurantPhotos({ filters, sortBy, page, size }),
    placeholderData: keepPreviousData,
  });

  return { isPending, error, photos: photos || [], count };
}
