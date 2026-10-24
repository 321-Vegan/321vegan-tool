import { useQuery } from "@tanstack/react-query";

import { getNearbyRestaurants } from "@/services/apiRestaurants";
import { restaurantsKeys } from "./queryKeyFactory";

export function useNearbyRestaurants({ latitude, longitude }, radius) {
  const {
    isPending,
    data: restaurants = [],
    error,
  } = useQuery({
    queryKey: restaurantsKeys.nearby(latitude, longitude, radius),
    queryFn: () => getNearbyRestaurants({ latitude, longitude, radius }),
  });

  return { isPending, error, restaurants };
}
