import { useQuery } from "@tanstack/react-query";

import { countReviews } from "@/services/apiReviews";

import { reviewsKeys } from "@/features/reviews/queryKeyFactory";

export function useReviewsCount(resource, filters) {
  const {
    isPending,
    data: count = 0,
    error,
  } = useQuery({
    queryKey: reviewsKeys.count(resource, filters),
    queryFn: () => countReviews(resource, filters),
  });

  return { isPending, error, count };
}
