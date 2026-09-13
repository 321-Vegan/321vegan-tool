import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { reverseGeocode } from "@/services/apiGeocoding";

export function useReverseGeocode() {
  const { mutate: fetchAddress, isPending: isFetchingAddress } = useMutation({
    mutationFn: ({ lat, lng }) => reverseGeocode(lat, lng),
    onError: (err) => toast.error(err.message),
  });

  return { fetchAddress, isFetchingAddress };
}
