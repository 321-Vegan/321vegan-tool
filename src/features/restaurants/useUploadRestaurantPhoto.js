import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { uploadRestaurantPhoto } from "@/services/apiRestaurants";
import { restaurantsKeys } from "./queryKeyFactory";

export function useUploadRestaurantPhoto() {
  const queryClient = useQueryClient();

  const { isPending: isUploading, mutate: uploadPhoto } = useMutation({
    mutationFn: uploadRestaurantPhoto,
    onSuccess: () => {
      toast.success("La photo a bien été ajoutée");
      queryClient.invalidateQueries({ queryKey: restaurantsKeys.all() });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isUploading, uploadPhoto };
}
