import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  deleteVeganuaryWeek as deleteVeganuaryWeekApi,
} from "@/services/apiVeganuary";

import { veganuaryKeys } from "./queryKeyFactory";

export function useDeleteVeganuaryWeek() {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutate: deleteVeganuaryWeek } = useMutation({
    mutationFn: deleteVeganuaryWeekApi,
    onSuccess: () => {
      toast.success(
        "La semaine a été supprimée : l'app reprend sa version embarquée",
      );
      queryClient.invalidateQueries({ queryKey: veganuaryKeys.all() });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isDeleting, deleteVeganuaryWeek };
}
