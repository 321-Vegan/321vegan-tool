import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrand as createBrandApi } from "@/services/apiBrands";
import { brandsKeys } from "./queryKeyFactory";
import toast from "react-hot-toast";

export function useCreateBrand() {
  const queryClient = useQueryClient();

  const { isPending: isCreating, mutate: createBrand } = useMutation({
    mutationFn: ({ parent_id, name, boycott, email, background }) =>
      createBrandApi({
        parent_id: parent_id,
        name: name,
        boycott: boycott,
        email: email || null,
        background: background || null,
      }),
    onSuccess: () => {
      toast.success("La marque a bien été créée");
      return queryClient.invalidateQueries({
        queryKey: brandsKeys.all(),
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { isCreating, createBrand };
}
