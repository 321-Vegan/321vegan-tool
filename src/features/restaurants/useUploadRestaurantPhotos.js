import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { uploadRestaurantPhoto } from "@/services/apiRestaurants";
import { restaurantsKeys } from "./queryKeyFactory";

// One after the other, as the API checks the photo limit on each upload.
// A failed one doesn't stop the others.
async function uploadRestaurantPhotos({ restaurantId, kind, files }) {
  const photos = [];
  const errors = [];
  for (const file of files) {
    try {
      photos.push(await uploadRestaurantPhoto({ restaurantId, kind, file }));
    } catch (error) {
      errors.push(`${file.name} : ${error.message}`);
    }
  }
  if (!photos.length) throw new Error(errors.join("\n"));
  return { photos, errors };
}

export function useUploadRestaurantPhotos() {
  const queryClient = useQueryClient();

  const { isPending: isUploading, mutate: uploadPhotos } = useMutation({
    mutationFn: uploadRestaurantPhotos,
    onSuccess: ({ photos, errors }) => {
      toast.success(
        photos.length > 1
          ? `${photos.length} photos ont bien été ajoutées`
          : "La photo a bien été ajoutée",
      );
      if (errors.length) toast.error(errors.join("\n"));
      queryClient.invalidateQueries({ queryKey: restaurantsKeys.all() });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isUploading, uploadPhotos };
}
