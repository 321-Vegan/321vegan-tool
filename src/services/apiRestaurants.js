import { buildURLSearchParams } from "@/utils/helpers";
import { API_URL } from "@/utils/constants";
import axiosInstance from "@/services/axiosInstance";

// The restaurant routes check business rules (vegan options details, caterer
// without storefront...): surface the API message instead of a bare status.
function toError(action, error) {
  if (error.response) {
    if (error.response.status === 401) return error;
    const detail = error.response.data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((d) => d.msg).join(", ")
      : detail;
    return new Error(
      `${action}. ${message || `Response status: ${error.response.status}`}`,
    );
  }
  if (error.request) {
    return new Error(`${action}. Request error: ${error.request}`);
  }
  return new Error(`${action}. Error: ${error.message}`);
}

// There's no dedicated /restaurants/count endpoint: the search endpoint's
// paginated response already carries the total, so we just ask for 1 item.
export async function countRestaurants(filters) {
  try {
    const params = buildURLSearchParams(filters, "", 1, 1);
    const res = await axiosInstance.get(
      [`${API_URL}/restaurants/search`, params].filter(Boolean).join("?"),
    );
    return res.data.total;
  } catch (error) {
    throw toError("Couldn't load restaurants count", error);
  }
}

export async function getSearchRestaurants({ filters, sortBy, page, size }) {
  try {
    const params = buildURLSearchParams(filters, sortBy, page, size);
    const res = await axiosInstance.get(
      [`${API_URL}/restaurants/search`, params].filter(Boolean).join("?"),
    );
    return { data: res.data.items, count: res.data.total };
  } catch (error) {
    throw toError("Couldn't load searched restaurants", error);
  }
}

// Validated and pending restaurants around a point, closest first.
export async function getNearbyRestaurants({ latitude, longitude, radius }) {
  try {
    const params = new URLSearchParams({ latitude, longitude, radius });
    const res = await axiosInstance.get(
      `${API_URL}/restaurants/nearby?${params}`,
    );
    return res.data;
  } catch (error) {
    throw toError("Couldn't load nearby restaurants", error);
  }
}

export async function updateRestaurant(id, restaurant) {
  try {
    const res = await axiosInstance.put(
      `${API_URL}/restaurants/${id}`,
      restaurant,
    );
    return res.data;
  } catch (error) {
    throw toError(`Couldn't update restaurant # ${id}`, error);
  }
}

export async function deleteRestaurant(id) {
  try {
    const res = await axiosInstance.delete(`${API_URL}/restaurants/${id}`);
    return res.data;
  } catch (error) {
    throw toError(`Couldn't delete restaurant # ${id}`, error);
  }
}

export async function countRestaurantPhotos(filters) {
  try {
    const params = buildURLSearchParams(filters, "", 1, 1);
    const res = await axiosInstance.get(
      [`${API_URL}/restaurants/photos/search`, params]
        .filter(Boolean)
        .join("?"),
    );
    return res.data.total;
  } catch (error) {
    throw toError("Couldn't load restaurant photos count", error);
  }
}

// Place and menu photos of validated restaurants (review photos follow their
// review, and a pending restaurant's photos are approved with it).
export async function getSearchRestaurantPhotos({
  filters,
  sortBy,
  page,
  size,
}) {
  try {
    const params = buildURLSearchParams(filters, sortBy, page, size);
    const res = await axiosInstance.get(
      [`${API_URL}/restaurants/photos/search`, params]
        .filter(Boolean)
        .join("?"),
    );
    return { data: res.data.items, count: res.data.total };
  } catch (error) {
    throw toError("Couldn't load restaurant photos", error);
  }
}

export async function updateRestaurantPhotoStatus(photoId, status) {
  try {
    const res = await axiosInstance.patch(
      `${API_URL}/restaurants/photos/${photoId}/status`,
      { status },
    );
    return res.data;
  } catch (error) {
    throw toError(`Couldn't update restaurant photo # ${photoId}`, error);
  }
}

export async function deleteRestaurantPhoto({ restaurantId, photoId }) {
  try {
    const res = await axiosInstance.delete(
      `${API_URL}/restaurants/${restaurantId}/photos/${photoId}`,
    );
    return res.data;
  } catch (error) {
    throw toError(`Couldn't delete restaurant photo # ${photoId}`, error);
  }
}

// The photo shown first on the restaurant page (replaces the previous one).
export async function featureRestaurantPhoto({ restaurantId, photoId }) {
  try {
    const res = await axiosInstance.patch(
      `${API_URL}/restaurants/${restaurantId}/photos/${photoId}/featured`,
    );
    return res.data;
  } catch (error) {
    throw toError(`Couldn't feature restaurant photo # ${photoId}`, error);
  }
}
