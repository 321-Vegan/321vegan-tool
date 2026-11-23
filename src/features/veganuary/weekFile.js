import { S3_STORAGE_URL } from "@/utils/constants";

// A week's JSON as a weekN.json file: a copy to keep (the content is only on
// the API), to import again, or to check with the app's tests.

export function downloadWeek(content) {
  const blob = new Blob([`${JSON.stringify(content, null, 2)}\n`], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `week${content.number}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Where an image of a week can be seen: its path in the bucket
// ("veganuary/…"), or a URL; null for an asset of the app ("lib/assets/…").
export function imageUrl(src) {
  if (src.startsWith("lib/")) return null;
  if (src.startsWith("http")) return src;
  return `${S3_STORAGE_URL}/${src}`;
}

export const isImagePath = (value) =>
  typeof value === "string" && /\.(webp|png|jpe?g|gif)$/i.test(value);

// Immutable copy of [value] with [newValue] at [path] (keys and indexes).
export function setAt(value, path, newValue) {
  if (path.length === 0) return newValue;
  const [key, ...rest] = path;
  const copy = Array.isArray(value) ? [...value] : { ...value };
  copy[key] = setAt(value[key], rest, newValue);
  return copy;
}
