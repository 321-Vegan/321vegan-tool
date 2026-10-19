import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBrand as updateBrandApi } from "@/services/apiBrands";
import { brandsKeys } from "./queryKeyFactory";
import toast from "react-hot-toast";

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  const { isPending: isUpdating, mutate: updateBrand } = useMutation({
    mutationFn: ({ id, newData }) => {
      const { parent_id, name, boycott, email, background } = newData;
      return updateBrandApi(id, {
        parent_id: parent_id,
        name: name,
        boycott: boycott,
        email: email || null,
        background: background || null,
      });
    },
    onSuccess: () => {
      toast.success("La marque a bien été modifiée");
      return queryClient.invalidateQueries({
        queryKey: brandsKeys.all(),
      });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isUpdating, updateBrand };
}
