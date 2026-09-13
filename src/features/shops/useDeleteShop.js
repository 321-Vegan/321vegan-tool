import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { deleteShop as deleteShopApi } from "@/services/apiShops";
import { shopsKeys } from "./queryKeyFactory";

export function useDeleteShop() {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutate: deleteShop } = useMutation({
    mutationFn: deleteShopApi,
    onSuccess: () => {
      toast.success("Le lieu a bien été supprimé");
      queryClient.invalidateQueries({ queryKey: shopsKeys.all() });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isDeleting, deleteShop };
}
