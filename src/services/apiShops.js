import { buildURLSearchParams } from "@/utils/helpers";
import { API_URL } from "@/utils/constants";
import axiosInstance from "@/services/axiosInstance";

// There's no dedicated /shops/count endpoint: the search endpoint's
// paginated response already carries the total, so we just ask for 1 item.
export async function countShops(filters) {
  try {
    const params = buildURLSearchParams(filters, "", 1, 1);
    const res = await axiosInstance.get(
      [`${API_URL}/shops/search`, params].filter(Boolean).join("?"),
    );
    const data = await res.data;
    return data.total;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't load shops count. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't load shops count. Request error: ${error.request}`,
      );
    } else {
      throw new Error(`Couldn't load shops count. Error: ${error.message}`);
    }
  }
}

export async function getSearchShops({ filters, sortBy, page, size }) {
  try {
    const params = buildURLSearchParams(filters, sortBy, page, size);
    const res = await axiosInstance.get(
      [`${API_URL}/shops/search`, params].filter(Boolean).join("?"),
    );
    const data = await res.data;
    return { data: data.items, count: data.total };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't load searched shops. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't load searched shops. Request error: ${error.request}`,
      );
    } else {
      throw new Error(`Couldn't load searched shops. Error: ${error.message}`);
    }
  }
}

// Returns every non-deleted shop (validated or not) inside the bounding box,
// capped at 300 by the API.
export async function getShopsInArea({ minLat, maxLat, minLng, maxLng }) {
  try {
    const params = new URLSearchParams({
      min_lat: minLat,
      max_lat: maxLat,
      min_lng: minLng,
      max_lng: maxLng,
    });
    const res = await axiosInstance.get(`${API_URL}/shops/in-area?${params}`);
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't load shops in area. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't load shops in area. Request error: ${error.request}`,
      );
    } else {
      throw new Error(`Couldn't load shops in area. Error: ${error.message}`);
    }
  }
}

export async function updateShop(id, shop) {
  try {
    const res = await axiosInstance.put(`${API_URL}/shops/${id}`, shop);
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't update shop # ${id}. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't update shop # ${id}. Request error: ${error.request}`,
      );
    } else {
      throw new Error(`Couldn't update shop # ${id}. Error: ${error.message}`);
    }
  }
}

export async function deleteShop(id) {
  try {
    const res = await axiosInstance.delete(`${API_URL}/shops/${id}`);
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't delete shop # ${id}. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't delete shop # ${id}. Request error: ${error.request}`,
      );
    } else {
      throw new Error(`Couldn't delete shop # ${id}. Error: ${error.message}`);
    }
  }
}
