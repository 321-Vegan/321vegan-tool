import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { updateRestaurant } from "@/services/apiRestaurants";
import { restaurantsKeys } from "./queryKeyFactory";

export function useValidateRestaurant() {
  const queryClient = useQueryClient();

  const { isPending: isValidating, mutate: validateRestaurant } = useMutation({
    mutationFn: ({ id, ...fields }) =>
      updateRestaurant(id, { ...fields, validated: true }),
    onSuccess: () => {
      toast.success("Le restaurant a bien été validé");
      queryClient.invalidateQueries({ queryKey: restaurantsKeys.all() });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isValidating, validateRestaurant };
}
