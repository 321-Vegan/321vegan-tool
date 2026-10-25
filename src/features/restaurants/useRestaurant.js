import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getRestaurant, getRestaurantHistory } from "@/services/apiRestaurants";
import { restaurantsKeys } from "./queryKeyFactory";

export function useRestaurant() {
  const { restaurantId } = useParams();

  const {
    isPending: isPendingRestaurant,
    data: restaurant,
    error,
  } = useQuery({
    queryKey: restaurantsKeys.detail(restaurantId),
    queryFn: () => getRestaurant(restaurantId),
    retry: false,
  });

  const { isPending: isPendingHistory, data: history } = useQuery({
    queryKey: restaurantsKeys.history(restaurantId),
    queryFn: () => getRestaurantHistory(restaurantId),
    // The query will not execute until the restaurant exists
    enabled: !!restaurant,
  });

  const isPending = isPendingRestaurant || (!!restaurant && isPendingHistory);
  return { isPending, error, restaurant, history: history || [] };
}
