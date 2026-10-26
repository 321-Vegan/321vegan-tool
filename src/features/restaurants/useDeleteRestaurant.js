import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { deleteRestaurant as deleteRestaurantApi } from "@/services/apiRestaurants";
import { restaurantsKeys } from "./queryKeyFactory";

export function useDeleteRestaurant() {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutate: deleteRestaurant } = useMutation({
    mutationFn: deleteRestaurantApi,
    onSuccess: (_, { rejectionReason }) => {
      toast.success(
        rejectionReason !== undefined
          ? "Le restaurant a bien été refusé"
          : "Le restaurant a bien été supprimé",
      );
      queryClient.invalidateQueries({ queryKey: restaurantsKeys.all() });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isDeleting, deleteRestaurant };
}
