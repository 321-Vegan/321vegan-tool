// The week's JSON as in the app's lib/assets/veganuary/weekN.json, to put
// back there (the app's repository stays the reference) or to read one.

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

// Immutable copy of [value] with [newValue] at [path] (keys and indexes).
export function setAt(value, path, newValue) {
  if (path.length === 0) return newValue;
  const [key, ...rest] = path;
  const copy = Array.isArray(value) ? [...value] : { ...value };
  copy[key] = setAt(value[key], rest, newValue);
  return copy;
}
