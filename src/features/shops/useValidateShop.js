import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { updateShop } from "@/services/apiShops";
import { shopsKeys } from "./queryKeyFactory";

export function useValidateShop() {
  const queryClient = useQueryClient();

  const { isPending: isValidating, mutate: validateShop } = useMutation({
    mutationFn: ({ id, ...fields }) =>
      updateShop(id, { ...fields, validated: true }),
    onSuccess: () => {
      toast.success("Le lieu a bien été validé");
      queryClient.invalidateQueries({ queryKey: shopsKeys.all() });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isValidating, validateShop };
}
