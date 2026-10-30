import {
  lockProduct,
  unlockProduct,
  unlockProductOnLeave,
} from "@/services/apiProducts";
import { useValidationLock } from "@/hooks/useValidationLock";

const LOCK_API = {
  lock: lockProduct,
  unlock: unlockProduct,
  unlockOnLeave: unlockProductOnLeave,
};

// Lock the product while the contributor is on it, so that no one else verifies it at the same time.
// See useValidationLock for "holder" and "onFreed".
export function useProductLock(productId, options) {
  return useValidationLock(productId, LOCK_API, options);
}
