import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteReview as deleteReviewApi } from "@/services/apiReviews";
import { reviewsKeys } from "./queryKeyFactory";
import toast from "react-hot-toast";

export function useDeleteReview(resource) {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutate: deleteReview } = useMutation({
    mutationFn: (id) => deleteReviewApi(resource, id),
    onSuccess: () => {
      toast.success("L'avis a bien été supprimé");
      queryClient.invalidateQueries({
        queryKey: reviewsKeys.all(resource),
      });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isDeleting, deleteReview };
}
