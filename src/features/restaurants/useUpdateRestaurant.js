import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { updateRestaurant as updateRestaurantApi } from "@/services/apiRestaurants";
import { restaurantsKeys } from "./queryKeyFactory";

export function useUpdateRestaurant() {
  const queryClient = useQueryClient();

  const { isPending: isUpdating, mutate: updateRestaurant } = useMutation({
    mutationFn: ({ id, newData }) => updateRestaurantApi(id, newData),
    onSuccess: () => {
      toast.success("Le lieu a bien été modifié");
      queryClient.invalidateQueries({ queryKey: restaurantsKeys.all() });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isUpdating, updateRestaurant };
}
