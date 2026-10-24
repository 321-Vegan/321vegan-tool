import { useSearchParams } from "react-router-dom";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

import { PAGE_SIZE } from "@/utils/constants";
import {
  applyRestaurantSuggestion,
  getSearchRestaurantSuggestions,
  rejectRestaurantSuggestion,
} from "@/services/apiRestaurants";
import { restaurantsKeys } from "./queryKeyFactory";

/** Suggestions to moderate, oldest first; `?status=` to see the others. */
export function useRestaurantSuggestions() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") || "PENDING";
  const filters = status === "all" ? [] : [{ field: "status", value: status }];
  const sortBy = status === "PENDING" ? "created_at-asc" : "created_at-desc";
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const size = !searchParams.get("size")
    ? PAGE_SIZE
    : Number(searchParams.get("size"));

  const {
    isPending,
    data: { data: suggestions, count } = {},
    error,
  } = useQuery({
    queryKey: restaurantsKeys.suggestionList(filters, sortBy, page, size),
    queryFn: () =>
      getSearchRestaurantSuggestions({ filters, sortBy, page, size }),
    placeholderData: keepPreviousData,
  });

  return { isPending, error, suggestions: suggestions || [], count, status };
}

export function useModerateRestaurantSuggestion() {
  const queryClient = useQueryClient();

  function onSuccess(message) {
    toast.success(message);
    // Applying changes restaurants too, not only the suggestions
    queryClient.invalidateQueries({ queryKey: restaurantsKeys.all() });
  }

  const { isPending: isApplying, mutate: applySuggestion } = useMutation({
    mutationFn: applyRestaurantSuggestion,
    onSuccess: () => onSuccess("La proposition a bien été appliquée"),
    onError: (err) => toast.error(err.message),
  });

  const { isPending: isRejecting, mutate: rejectSuggestion } = useMutation({
    mutationFn: rejectRestaurantSuggestion,
    onSuccess: () => onSuccess("La proposition a bien été rejetée"),
    onError: (err) => toast.error(err.message),
  });

  return {
    isWorking: isApplying || isRejecting,
    applySuggestion,
    rejectSuggestion,
  };
}
