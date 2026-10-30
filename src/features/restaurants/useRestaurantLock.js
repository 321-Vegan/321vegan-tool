import {
  lockRestaurant,
  unlockRestaurant,
  unlockRestaurantOnLeave,
} from "@/services/apiRestaurants";
import { useValidationLock } from "@/hooks/useValidationLock";

const LOCK_API = {
  lock: lockRestaurant,
  unlock: unlockRestaurant,
  unlockOnLeave: unlockRestaurantOnLeave,
};

// Lock the restaurant while the moderator is on it, so that no one else validates it at the same time.
// See useValidationLock for "holder" and "onFreed".
export function useRestaurantLock(restaurantId, options) {
  return useValidationLock(restaurantId, LOCK_API, options);
}
