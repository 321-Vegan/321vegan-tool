import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  getVeganuaryImages,
  uploadVeganuaryImage,
} from "@/services/apiVeganuary";

import { veganuaryKeys } from "./queryKeyFactory";

export function useVeganuaryImages() {
  const { isPending, data: images, error } = useQuery({
    queryKey: veganuaryKeys.images(),
    queryFn: getVeganuaryImages,
  });

  return { isPending, error, images };
}

export function useUploadVeganuaryImage() {
  const queryClient = useQueryClient();

  const { isPending: isUploading, mutateAsync: uploadImage } = useMutation({
    mutationFn: uploadVeganuaryImage,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: veganuaryKeys.images() }),
    onError: (err) => toast.error(err.message),
  });

  return { isUploading, uploadImage };
}
