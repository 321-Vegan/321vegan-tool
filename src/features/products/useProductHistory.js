import { useQuery } from "@tanstack/react-query";

import { getProductHistory } from "@/services/apiProducts";
import { productsKeys } from "./queryKeyFactory";

export function useProductHistory(productId) {
  const { isPending, data: history } = useQuery({
    // Under the product detail key (its id comes as a string from the URL)
    queryKey: productsKeys.history(String(productId)),
    queryFn: () => getProductHistory(productId),
    enabled: !!productId,
  });

  return { isPending, history: history || [] };
}
