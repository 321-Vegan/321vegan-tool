import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { sendBroadcast } from "@/services/apiNotifications";

import { notificationKeys } from "./queryKeyFactory";

export function useSendBroadcast() {
  const queryClient = useQueryClient();

  const { isPending: isSending, mutate: send } = useMutation({
    mutationFn: sendBroadcast,
    onSuccess: (broadcast) => {
      toast.success(
        `Notification envoyée à ${broadcast.recipient_count} comptes`,
      );
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isSending, send };
}
