import { useQuery } from "@tanstack/react-query";

import { getBroadcastRecipients, getBroadcasts } from "@/services/apiNotifications";

import { notificationKeys } from "./queryKeyFactory";

export function useBroadcasts() {
  const { isPending, data: broadcasts, error } = useQuery({
    queryKey: notificationKeys.all(),
    queryFn: getBroadcasts,
    // The pushes go out in the background (FCM worker): the counts move
    refetchInterval: 30_000,
  });

  return { isPending, error, broadcasts };
}

export function useBroadcastRecipients() {
  const { isPending, data: recipientCount } = useQuery({
    queryKey: notificationKeys.recipients(),
    queryFn: getBroadcastRecipients,
  });

  return { isPending, recipientCount };
}
