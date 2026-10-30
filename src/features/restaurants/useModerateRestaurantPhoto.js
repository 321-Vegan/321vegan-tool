import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  updateRestaurantPhotoKind,
  updateRestaurantPhotoStatus,
  deleteRestaurantPhoto as deleteRestaurantPhotoApi,
} from "@/services/apiRestaurants";
import { restaurantsKeys } from "./queryKeyFactory";

export function useModerateRestaurantPhoto() {
  const queryClient = useQueryClient();

  function onSuccess(message) {
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: restaurantsKeys.photos() });
  }

  const { isPending: isUpdatingStatus, mutate: updatePhotoStatus } =
    useMutation({
      mutationFn: ({ photoId, status }) =>
        updateRestaurantPhotoStatus(photoId, status),
      onSuccess: () => onSuccess("Le statut de la photo a bien été modifié"),
      onError: (err) => toast.error(err.message),
    });

  const { isPending: isUpdatingKind, mutate: updatePhotoKind } = useMutation({
    mutationFn: ({ photoId, kind }) => updateRestaurantPhotoKind(photoId, kind),
    onSuccess: () => {
      toast.success("La catégorie de la photo a bien été modifiée");
      // The restaurant page lists its photos too
      queryClient.invalidateQueries({ queryKey: restaurantsKeys.all() });
    },
    onError: (err) => toast.error(err.message),
  });

  const { isPending: isDeleting, mutate: deletePhoto } = useMutation({
    mutationFn: deleteRestaurantPhotoApi,
    onSuccess: () => onSuccess("La photo a bien été supprimée"),
    onError: (err) => toast.error(err.message),
  });

  return {
    isWorking: isUpdatingStatus || isUpdatingKind || isDeleting,
    updatePhotoStatus,
    updatePhotoKind,
    deletePhoto,
  };
}
