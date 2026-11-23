import { API_URL } from "@/utils/constants";
import axiosInstance from "./axiosInstance";

// The weeks of the app's Veganuary course stored on the API: they replace
// the app's bundled weekN.json without an app update.

function apiError(action, error) {
  if (error.response) {
    if (error.response.status === 401) return error;
    const detail = error.response.data?.detail;
    const reason =
      typeof detail === "string"
        ? detail
        : `Response status: ${error.response.status}`;
    return new Error(`${action}. ${reason}`);
  }
  if (error.request) return new Error(`${action}. Request error.`);
  return new Error(`${action}. Error: ${error.message}`);
}

export async function getVeganuaryWeeks() {
  try {
    const res = await axiosInstance.get(`${API_URL}/veganuary-weeks/`);
    return res.data;
  } catch (error) {
    throw apiError("Couldn't load the Veganuary weeks", error);
  }
}

export async function putVeganuaryWeek(content) {
  try {
    const res = await axiosInstance.put(
      `${API_URL}/veganuary-weeks/${content.number}`,
      { content },
    );
    return res.data;
  } catch (error) {
    throw apiError(`Couldn't save week ${content.number}`, error);
  }
}

export async function deleteVeganuaryWeek(number) {
  try {
    await axiosInstance.delete(`${API_URL}/veganuary-weeks/${number}`);
  } catch (error) {
    throw apiError(`Couldn't delete week ${number}`, error);
  }
}
