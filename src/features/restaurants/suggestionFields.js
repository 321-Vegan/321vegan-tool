import {
  DAYS,
  OPERATING_STATUSES,
  RESTAURANT_TAGS,
  SERVICE_OPTIONS,
  VEGAN_STATUSES,
} from "./restaurantConstants";
import { stopDaysText, stopTitle } from "./openingHours";

export const SUGGESTION_KINDS = {
  EDIT: { color: "blue", label: "Modification" },
  NO_VEGAN_OPTION: { color: "red", label: "Fin des options véganes" },
  DUPLICATE: { color: "orange", label: "Doublon" },
};

export const SUGGESTION_STATUSES = {
  PENDING: { color: "silver", label: "En attente" },
  APPROVED: { color: "green", label: "Appliquée" },
  PARTIALLY_APPROVED: { color: "yellow", label: "Appliquée en partie" },
  REJECTED: { color: "red", label: "Rejetée" },
};

// Mirrors the API's RestaurantBase fields, plus the photos to remove.
// `input`: the field can be retouched before applying.
export const SUGGESTION_FIELDS = {
  name: { label: "Nom", input: "text" },
  address: { label: "Adresse", input: "text" },
  city: { label: "Ville", input: "text" },
  country: { label: "Pays", input: "text" },
  latitude: { label: "Latitude", input: "number" },
  longitude: { label: "Longitude", input: "number" },
  description: { label: "Description", input: "textarea" },
  vegan_status: { label: "Statut végane" },
  vegan_options_details: { label: "Options véganes", input: "textarea" },
  has_gluten_free_options: { label: "Options sans gluten" },
  tags: { label: "Types" },
  service_options: { label: "Possibilités" },
  plant_milk_surcharge: { label: "Supplément lait végétal", input: "number" },
  serves_hot_drinks: { label: "Boissons chaudes" },
  has_storefront: { label: "Avec boutique" },
  service_area: { label: "Zone servie", input: "text" },
  opening_hours: { label: "Horaires" },
  opening_hours_note: { label: "Note horaires", input: "text" },
  stops: { label: "Emplacements" },
  phone: { label: "Téléphone", input: "text" },
  website: { label: "Site web", input: "text" },
  facebook: { label: "Facebook", input: "text" },
  instagram: { label: "Instagram", input: "text" },
  menu_url: { label: "Lien du menu", input: "text" },
  operating_status: { label: "Ouverture" },
  closed_from: { label: "Fermé du", input: "date" },
  closed_until: { label: "Fermé jusqu'au", input: "date" },
  closure_note: { label: "Note fermeture", input: "text" },
  remove_photo_ids: { label: "Photos à retirer" },
  featured_photo_id: { label: "Photo principale" },
};

const tagLabel = (value) =>
  RESTAURANT_TAGS.find((t) => t.value === value)?.label || value;

/** A suggestion value in words, "—" when empty. */
export function formatSuggestionValue(field, value) {
  if (value === null || value === undefined || value === "") return "—";
  switch (field) {
    case "vegan_status":
      return VEGAN_STATUSES[value]?.label || value;
    case "operating_status":
      return OPERATING_STATUSES[value]?.label || value;
    case "tags":
      return value.map(tagLabel).join(", ") || "—";
    case "service_options":
      return (
        value
          .map((v) => SERVICE_OPTIONS.find((o) => o.value === v)?.label || v)
          .join(", ") || "—"
      );
    case "has_storefront":
    case "has_gluten_free_options":
    case "serves_hot_drinks":
      return value ? "Oui" : "Non";
    case "plant_milk_surcharge":
      return `${value > 0 ? "+" : ""}${String(value).replace(".", ",")} €`;
    case "opening_hours":
      if (!value.length) return "—";
      return DAYS.map((day, index) => {
        const slots = value
          .filter((slot) => slot.day === index)
          .map((slot) => `${slot.open}–${slot.close}`);
        return `${day.slice(0, 3)} ${slots.length ? slots.join(", ") : "fermé"}`;
      }).join(" · ");
    case "stops":
      if (!value.length) return "—";
      return value
        .map(
          (stop) =>
            `${stopTitle(stop)} (${stopDaysText(stop.opening_hours)}${stop.note ? `, ${stop.note}` : ""})`,
        )
        .join(" ; ");
    case "remove_photo_ids":
      return value.length ? `${value.length} photo(s)` : "—";
    default:
      return String(value);
  }
}

export function sameValue(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

// How formatSuggestionValue joins the items of a list field
const LIST_SEPARATORS = {
  tags: ", ",
  service_options: ", ",
  opening_hours: " · ",
  stops: " ; ",
};

// Past this many LCS cells, the whole value is shown as replaced
const MAX_DIFF_CELLS = 250000;

/** A formatted value cut into the units the diff compares, separators kept. */
function diffTokens(field, value) {
  const text = formatSuggestionValue(field, value);
  if (text === "—") return [];
  const separator = LIST_SEPARATORS[field];
  if (separator) return text.split(new RegExp(`(${separator})`));
  // Free text compares word by word, other values as a whole
  const input = SUGGESTION_FIELDS[field]?.input;
  if (input === "text" || input === "textarea") {
    return text.split(/(\s+)/).filter(Boolean);
  }
  return [text];
}

/**
 * What a suggestion changes in a field, as [{ type, text }] parts where type
 * is "same", "removed" (only in `from`) or "added" (only in `to`).
 * */
export function diffSuggestionValues(field, from, to) {
  const a = diffTokens(field, from);
  const b = diffTokens(field, to);
  const parts = [];
  const push = (type, text) => {
    const last = parts.at(-1);
    if (last?.type === type) last.text += text;
    else parts.push({ type, text });
  };

  if (a.length * b.length > MAX_DIFF_CELLS) {
    if (a.length) push("removed", a.join(""));
    if (b.length) push("added", b.join(""));
    return parts;
  }

  // lcs[i][j]: longest common subsequence of a[i:] and b[j:]
  const lcs = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] =
        a[i] === b[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      push("same", a[i]);
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      push("removed", a[i++]);
    } else {
      push("added", b[j++]);
    }
  }
  while (i < a.length) push("removed", a[i++]);
  while (j < b.length) push("added", b[j++]);
  return parts;
}
