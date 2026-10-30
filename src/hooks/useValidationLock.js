import { useEffect, useRef, useState } from "react";

// The API locks expire after 10 minutes without being renewed.
const RENEW_INTERVAL = 2 * 60 * 1000;
// While someone else is on the item, check regularly if it's free again.
const RETRY_INTERVAL = 30 * 1000;

// Lock an item (product, restaurant…) while the user is on it, so that no one else validates it at the same time.
// "api" holds the module-level { lock, unlock, unlockOnLeave } calls of the item: "lock" resolves to the lock of
// the user already on it ({ locked_by, locked_at }), or null once it's ours.
// "holder" is that other user's lock, or null if it's ours.
// "onFreed" is awaited when the item is freed by someone else, to reload what they may have changed.
export function useValidationLock(id, api, { enabled = true, onFreed } = {}) {
  const [lock, setLock] = useState({ isPending: true, holder: null });
  const onFreedRef = useRef(onFreed);
  onFreedRef.current = onFreed;

  useEffect(() => {
    if (!enabled || !id) return;

    let isCancelled = false;
    let isOwner = false;
    let wasHeld = false;
    let timer;

    async function takeLock() {
      let holder = null;
      try {
        holder = await api.lock(id);
      } catch (error) {
        // The lock is a convenience: never prevent the validation because of it.
        console.error(error);
      }
      if (isCancelled) {
        // We left the item while the lock was being taken
        if (!holder) api.unlock(id).catch(console.error);
        return;
      }

      isOwner = !holder;
      if (isOwner && wasHeld) {
        setLock({ isPending: true, holder: null });
        await onFreedRef.current?.();
        if (isCancelled) return;
      }
      wasHeld = Boolean(holder);
      setLock({ isPending: false, holder });
      timer = setTimeout(takeLock, holder ? RETRY_INTERVAL : RENEW_INTERVAL);
    }

    function releaseOnLeave() {
      if (isOwner) api.unlockOnLeave(id);
    }

    takeLock();
    window.addEventListener("pagehide", releaseOnLeave);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      window.removeEventListener("pagehide", releaseOnLeave);
      if (isOwner) api.unlock(id).catch(console.error);
    };
  }, [id, api, enabled]);

  if (!enabled) return { isPending: false, holder: null };
  return lock;
}
