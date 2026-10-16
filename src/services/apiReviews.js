import { buildURLSearchParams } from "@/utils/helpers";
import { API_URL } from "@/utils/constants";
import axiosInstance from "@/services/axiosInstance";

/**
 * Reviews API, shared by every reviewed resource.
 *
 * @param {String} resource: API prefix, e.g. "shop-reviews" or "product-reviews"
 * */

export async function countReviews(resource, filters) {
  try {
    const params = buildURLSearchParams(filters);
    const res = await axiosInstance.get(
      [`${API_URL}/${resource}/count`, params].filter(Boolean).join("?"),
    );
    const data = res.data;
    return data.total;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't load ${resource} count. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't load ${resource} count. Request error: ${error.request}`,
      );
    } else {
      throw new Error(`Couldn't load ${resource} count. Error: ${error.message}`);
    }
  }
}

export async function getSearchReviews(
  resource,
  { filters, sortBy, page, size },
) {
  try {
    const params = buildURLSearchParams(filters, sortBy, page, size);
    const res = await axiosInstance.get(
      [`${API_URL}/${resource}/search`, params].filter(Boolean).join("?"),
    );
    const data = await res.data;
    return { data: data.items, count: data.total };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't load searched ${resource}. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't load searched ${resource}. Request error: ${error.request}`,
      );
    } else {
      throw new Error(
        `Couldn't load searched ${resource}. Error: ${error.message}`,
      );
    }
  }
}

export async function updateReviewStatus(resource, id, status) {
  try {
    const res = await axiosInstance.patch(
      `${API_URL}/${resource}/${id}/status`,
      { status: status },
    );
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't update ${resource} # ${id} status. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't update ${resource} # ${id} status. Request error: ${error.request}`,
      );
    } else {
      throw new Error(
        `Couldn't update ${resource} # ${id} status. Error: ${error.message}`,
      );
    }
  }
}

export async function deleteReview(resource, id) {
  try {
    const res = await axiosInstance.delete(`${API_URL}/${resource}/${id}`);
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't delete ${resource} # ${id}. Response status: ${error.response.status}`,
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't delete ${resource} # ${id}. Request error: ${error.request}`,
      );
    } else {
      throw new Error(`Couldn't delete ${resource} # ${id}. Error: ${error.message}`);
    }
  }
}
