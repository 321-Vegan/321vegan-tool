import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { updateRestaurant } from "@/services/apiRestaurants";
import { restaurantsKeys } from "./queryKeyFactory";

export function useSetRestaurantAside() {
  const queryClient = useQueryClient();

  const { isPending: isSettingAside, mutate: setRestaurantAside } =
    useMutation({
      mutationFn: ({ id, ...fields }) => updateRestaurant(id, fields),
      onSuccess: () => {
        toast.success("Le lieu a été mis de côté");
        queryClient.invalidateQueries({ queryKey: restaurantsKeys.all() });
      },
      onError: (err) => toast.error(err.message),
    });

  return { isSettingAside, setRestaurantAside };
}
