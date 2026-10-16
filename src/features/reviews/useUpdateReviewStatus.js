import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateReviewStatus as updateReviewStatusApi } from "@/services/apiReviews";
import { reviewsKeys } from "./queryKeyFactory";
import toast from "react-hot-toast";

export function useUpdateReviewStatus(resource) {
  const queryClient = useQueryClient();

  const { isPending: isUpdatingStatus, mutate: updateReviewStatus } =
    useMutation({
      mutationFn: ({ id, newStatus }) =>
        updateReviewStatusApi(resource, id, newStatus),
      onSuccess: () => {
        toast.success("Le statut de l'avis a bien été modifié");
        queryClient.invalidateQueries({
          queryKey: reviewsKeys.all(resource),
        });
      },
      onError: (err) => toast.error(err.message),
    });

  return { isUpdatingStatus, updateReviewStatus };
}
