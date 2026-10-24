import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { featureRestaurantPhoto } from "@/services/apiRestaurants";
import { restaurantsKeys } from "./queryKeyFactory";

export function useFeatureRestaurantPhoto() {
  const queryClient = useQueryClient();

  const { isPending: isFeaturing, mutate: featurePhoto } = useMutation({
    mutationFn: featureRestaurantPhoto,
    onSuccess: () => {
      toast.success("La photo principale a bien été changée");
      queryClient.invalidateQueries({ queryKey: restaurantsKeys.all() });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isFeaturing, featurePhoto };
}
