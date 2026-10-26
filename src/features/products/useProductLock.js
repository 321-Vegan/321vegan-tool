import { useEffect, useRef, useState } from "react";

import {
  lockProduct,
  unlockProduct,
  unlockProductOnLeave,
} from "@/services/apiProducts";

// The API lock expires after 10 minutes without being renewed.
const RENEW_INTERVAL = 2 * 60 * 1000;
// While someone else is on the product, check regularly if it's free again.
const RETRY_INTERVAL = 30 * 1000;

// Lock the product while the contributor is on it, so that no one else verifies it at the same time.
// "holder" is the lock of the contributor already on it ({ locked_by, locked_at }), or null if it's ours.
// "onFreed" is awaited when the product is freed by someone else, to reload what they may have changed.
export function useProductLock(productId, { enabled = true, onFreed } = {}) {
  const [lock, setLock] = useState({ isPending: true, holder: null });
  const onFreedRef = useRef(onFreed);
  onFreedRef.current = onFreed;

  useEffect(() => {
    if (!enabled || !productId) return;

    let isCancelled = false;
    let isOwner = false;
    let wasHeld = false;
    let timer;

    async function takeLock() {
      let holder = null;
      try {
        holder = await lockProduct(productId);
      } catch (error) {
        // The lock is a convenience: never prevent the verification because of it.
        console.error(error);
      }
      if (isCancelled) {
        // We left the product while the lock was being taken
        if (!holder) unlockProduct(productId).catch(console.error);
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
      if (isOwner) unlockProductOnLeave(productId);
    }

    takeLock();
    window.addEventListener("pagehide", releaseOnLeave);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      window.removeEventListener("pagehide", releaseOnLeave);
      if (isOwner) unlockProduct(productId).catch(console.error);
    };
  }, [productId, enabled]);

  if (!enabled) return { isPending: false, holder: null };
  return lock;
}
