import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { putVeganuaryWeek } from "@/services/apiVeganuary";

import { veganuaryKeys } from "./queryKeyFactory";

// Creates or replaces a week (its content checked with validateWeek first).
export function useSaveVeganuaryWeek() {
  const queryClient = useQueryClient();

  const { isPending: isSaving, mutateAsync: saveWeek } = useMutation({
    mutationFn: putVeganuaryWeek,
    onSuccess: (week) => {
      toast.success(`La semaine ${week.number} a bien été enregistrée`);
      queryClient.invalidateQueries({ queryKey: veganuaryKeys.all() });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isSaving, saveWeek };
}
