import {
  DAYS,
  OPERATING_STATUSES,
  RESTAURANT_TAGS,
  SERVICE_OPTIONS,
  VEGAN_STATUSES,
} from "./restaurantConstants";

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
  tags: { label: "Types" },
  service_options: { label: "Possibilités" },
  plant_milk_surcharge: { label: "Supplément lait végétal", input: "number" },
  serves_hot_drinks: { label: "Boissons chaudes" },
  has_storefront: { label: "Avec boutique" },
  service_area: { label: "Zone servie", input: "text" },
  opening_hours: { label: "Horaires" },
  opening_hours_note: { label: "Note horaires", input: "text" },
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
    case "remove_photo_ids":
      return value.length ? `${value.length} photo(s)` : "—";
    default:
      return String(value);
  }
}

export function sameValue(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}
