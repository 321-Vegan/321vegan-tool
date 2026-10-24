import { useQuery } from "@tanstack/react-query";

import {
  countRestaurants,
  countRestaurantPhotos,
} from "@/services/apiRestaurants";
import { restaurantsKeys } from "@/features/restaurants/queryKeyFactory";

const PENDING_RESTAURANTS = [{ field: "validated", value: false }];
const PENDING_PHOTOS = [{ field: "status", value: "PENDING" }];

export function useRestaurantsToModerateCount() {
  const { isPending: isPendingRestaurants, data: restaurantsCount = 0 } =
    useQuery({
      queryKey: restaurantsKeys.count(PENDING_RESTAURANTS),
      queryFn: () => countRestaurants(PENDING_RESTAURANTS),
    });
  const { isPending: isPendingPhotos, data: photosCount = 0 } = useQuery({
    queryKey: restaurantsKeys.photoCount(PENDING_PHOTOS),
    queryFn: () => countRestaurantPhotos(PENDING_PHOTOS),
  });

  return {
    isPendingRestaurants,
    restaurantsCount,
    isPendingPhotos,
    photosCount,
  };
}
