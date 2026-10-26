import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateUser as updateUserApi,
  updateUserFriendCode,
} from "@/services/apiUsers";
import { usersKeys } from "./queryKeyFactory";
import toast from "react-hot-toast";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  const { isPending: isUpdating, mutate: updateUser } = useMutation({
    // friendCode: given only when changed (empty for a new generated one).
    // Set first, so a taken code stops the save before anything changed.
    mutationFn: async ({ id, newData, friendCode }) => {
      if (friendCode !== undefined) await updateUserFriendCode(id, friendCode);
      return updateUserApi(id, newData);
    },
    onSuccess: () => {
      toast.success("L'utilisateurice a bien été modifié.e");
      queryClient.invalidateQueries({
        queryKey: usersKeys.all(),
      });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isUpdating, updateUser };
}
