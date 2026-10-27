import { buildURLSearchParams } from "@/utils/helpers";
import { API_URL } from "@/utils/constants";
import axiosInstance from "./axiosInstance";

export async function getUsers() {
  try {
    const res = await axiosInstance.get(`${API_URL}/users/`);
    const data = await res.data;
    return { data: data, count: data?.length };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't load users. Response status: ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error(`Couldn't load users. Request error: ${error.request}`);
    } else {
      throw new Error(`Couldn't load users. Error: ${error.message}`);
    }
  }
}

export async function getSearchUsers({ filters, sortBy, page, size }) {
  try {
    const params = buildURLSearchParams(filters, sortBy, page, size);
    const res = await axiosInstance.get(
      [`${API_URL}/users/search`, params].filter(Boolean).join("?")
    );
    const data = await res.data;
    return { data: data.items, count: data.total };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't load searched users. Response status: ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't load searched users. Request error: ${error.request}`
      );
    } else {
      throw new Error(`Couldn't load searched users. Error: ${error.message}`);
    }
  }
}

export async function getUser(id) {
  try {
    const res = await axiosInstance.get(`${API_URL}/users/${id}`);
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't find user #${id}. Response status: ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't find user #${id}. Request error: ${error.request}`
      );
    } else {
      throw new Error(`Couldn't find user #${id}. Error: ${error.message}`);
    }
  }
}

// Public profile and contribution counts (moderators); null once the
// account is deleted.
export async function getUserBrief(id) {
  try {
    const res = await axiosInstance.get(`${API_URL}/users/${id}/brief`);
    return res.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      if (error.response.status === 404) return null;
      throw new Error(
        `Couldn't find user #${id}. Response status: ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't find user #${id}. Request error: ${error.request}`
      );
    } else {
      throw new Error(`Couldn't find user #${id}. Error: ${error.message}`);
    }
  }
}

export async function createUser(user) {
  try {
    const res = await axiosInstance.post(`${API_URL}/users/`, user);
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      if (error.response.status === 409)
        throw new Error(`L'utilisateurice existe déjà.`);
      throw new Error(
        `Couldn't create user. Response status: ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error(`Couldn't create user. Request error: ${error.request}`);
    } else {
      throw new Error(`Couldn't create user. Error: ${error.message}`);
    }
  }
}

export async function updateUser(id, user) {
  try {
    const res = await axiosInstance.put(`${API_URL}/users/${id}`, user);
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      if (error.response.status === 409)
        throw new Error(`L'utilisateurice existe déjà.`);
      throw new Error(
        `Couldn't update user # ${id}. Response status: ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't update user # ${id}. Request error: ${error.request}`
      );
    } else {
      throw new Error(`Couldn't update user # ${id}. Error: ${error.message}`);
    }
  }
}

// Empty friendCode: the API generates a new one.
export async function updateUserFriendCode(id, friendCode) {
  try {
    const res = await axiosInstance.put(`${API_URL}/users/${id}/friend-code`, {
      friend_code: friendCode || null,
    });
    return res.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      if (error.response.status === 409)
        throw new Error("Ce code ami est déjà pris.");
      if (error.response.status === 422)
        throw new Error(
          "Code ami invalide : de 4 à 16 lettres, chiffres ou « _ ».",
        );
      throw new Error(
        `Couldn't update friend code of user # ${id}. Response status: ${error.response.status}`,
      );
    }
    throw new Error(
      `Couldn't update friend code of user # ${id}. Error: ${error.message}`,
    );
  }
}

export async function deleteUser(id) {
  try {
    const res = await axiosInstance.delete(`${API_URL}/users/${id}`);
    const data = await res.data;
    return data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) throw error;
      throw new Error(
        `Couldn't delete user # ${id}. Response status: ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error(
        `Couldn't delete user # ${id}. Request error: ${error.request}`
      );
    } else {
      throw new Error(`Couldn't delete user # ${id}. Error: ${error.message}`);
    }
  }
}
