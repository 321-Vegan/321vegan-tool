import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateProduct as updateProductApi,
  uploadProductImage,
  deleteProductImage,
  uploadProductBrandAnswer,
  deleteProductBrandAnswer,
} from "@/services/apiProducts";
import { productsKeys } from "./queryKeyFactory";
import toast from "react-hot-toast";

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  const { isPending: isUpdating, mutate: updateProduct } = useMutation({
    mutationFn: async ({ id, newData }) => {
      const { image, brand_answer } = newData;
      const newProductData = {
        ...newData,
        brand_id: newData?.brand_id || newData?.brand?.id || null,
      };

      const imageIsUnchanged =
        typeof image === "string" || image instanceof String;
      const brandAnswerIsUnchanged =
        typeof brand_answer === "string" || brand_answer instanceof String;

      const fileRequests = [];
      if (!imageIsUnchanged) {
        fileRequests.push(
          image ? uploadProductImage(id, image) : deleteProductImage(id),
        );
      }
      if (!brandAnswerIsUnchanged) {
        fileRequests.push(
          brand_answer
            ? uploadProductBrandAnswer(id, brand_answer)
            : deleteProductBrandAnswer(id),
        );
      }

      return Promise.all([
        updateProductApi(id, newProductData),
        ...fileRequests,
      ]);
    },
    onSuccess: () => {
      toast.success("Le produit a bien été modifié");
      return queryClient.invalidateQueries({
        queryKey: productsKeys.all(),
      });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isUpdating, updateProduct };
}
