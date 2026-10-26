import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { productsKeys } from "./queryKeyFactory";

import { getProductByEan } from "@/services/apiProducts";

export function useProductByEan(ean) {
  // if needed we can pass ean to the hook instead of get it from the URL
  const { productEan } = useParams();

  const {
    isPending,
    data: product,
    error,
    refetch,
  } = useQuery({
    queryKey: productsKeys.detail(ean || productEan),
    queryFn: () => getProductByEan(ean || productEan),
    retry: false,
  });

  return { isPending, error, product, refetch };
}
