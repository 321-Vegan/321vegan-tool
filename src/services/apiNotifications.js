import { API_URL } from "@/utils/constants";
import axiosInstance from "./axiosInstance";

// Notifications sent to every account with pushes turned on: in the app's
// notification center, and as a push.

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

// The last ones sent, newest first, with their reads and pushes
export async function getBroadcasts() {
  try {
    const res = await axiosInstance.get(`${API_URL}/notification-broadcasts/`);
    return res.data;
  } catch (error) {
    throw apiError("Impossible de charger les notifications envoyées", error);
  }
}

// How many accounts a notification sent now would reach
export async function getBroadcastRecipients() {
  try {
    const res = await axiosInstance.get(
      `${API_URL}/notification-broadcasts/recipients`,
    );
    return res.data.count;
  } catch (error) {
    throw apiError("Impossible de compter les destinataires", error);
  }
}

export async function sendBroadcast({ title, body }) {
  try {
    const res = await axiosInstance.post(
      `${API_URL}/notification-broadcasts/`,
      { title, body },
    );
    return res.data;
  } catch (error) {
    throw apiError("Impossible d'envoyer la notification", error);
  }
}
