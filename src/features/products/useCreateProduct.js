import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProduct as createProductApi,
  uploadProductImage,
} from "@/services/apiProducts";
import { productsKeys } from "./queryKeyFactory";
import toast from "react-hot-toast";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  const { isPending: isCreating, mutate: createProduct } = useMutation({
    mutationFn: async ({
      state,
      status,
      product_type,
      brand_id,
      ean,
      name,
      description,
      biodynamic,
      has_non_vegan_old_receipe,
      image,
    }) => {
      let product = await createProductApi({
        state,
        status,
        product_type,
        ean,
        name,
        description,
        biodynamic,
        has_non_vegan_old_receipe,
        brand_id: brand_id || null,
      });
      if (image) {
        product = await uploadProductImage(product.id, image);
      }
      return Promise.resolve(product);
    },
    onSuccess: () => {
      toast.success("Le produit a bien été créé");
      queryClient.invalidateQueries({
        queryKey: productsKeys.all(),
      });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isCreating, createProduct };
}
