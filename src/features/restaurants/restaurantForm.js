// Restaurant form logic shared by the detail page and the validator: API
// restaurant → form values → PUT body, and the API rules to check first.
import {
  MAX_STOPS,
  openingHoursError,
  sortSlots,
  withKey,
  withoutKey,
} from "./openingHours";

export const MAX_PLANT_MILK_SURCHARGE = 5;
const CONTACT_FIELDS = ["phone", "website", "facebook", "instagram"];

// Trimmed text, null when empty
export const text = (value) => value?.trim() || null;

export const toOptions = (statuses) =>
  Object.entries(statuses).map(([value, { label }]) => ({ value, label }));

// API restaurant → form values (text inputs want strings)
export function toFormValues(restaurant) {
  const text = (value) => value ?? "";
  return {
    name: text(restaurant.name),
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,
    address: text(restaurant.address),
    city: text(restaurant.city),
    country: text(restaurant.country),
    description: text(restaurant.description),
    vegan_status: restaurant.vegan_status,
    vegan_options_details: text(restaurant.vegan_options_details),
    has_gluten_free_options: restaurant.has_gluten_free_options,
    tags: restaurant.tags,
    service_options: restaurant.service_options || [],
    plant_milk_surcharge:
      restaurant.plant_milk_surcharge === null
        ? ""
        : String(restaurant.plant_milk_surcharge),
    no_hot_drinks: restaurant.serves_hot_drinks === false,
    has_storefront: restaurant.has_storefront,
    service_area: text(restaurant.service_area),
    opening_hours: restaurant.opening_hours || [],
    opening_hours_note: text(restaurant.opening_hours_note),
    stops: (restaurant.stops || []).map(withKey),
    phone: text(restaurant.phone),
    website: text(restaurant.website),
    facebook: text(restaurant.facebook),
    instagram: text(restaurant.instagram),
    menu_url: text(restaurant.menu_url),
    operating_status: restaurant.operating_status,
    closed_from: text(restaurant.closed_from),
    closed_until: text(restaurant.closed_until),
    closure_note: text(restaurant.closure_note),
    validated: restaurant.validated,
  };
}

// Form values → PUT body. The fields that don't apply any more are cleared.
// With stops, the first one is the position and the hours are all of
// theirs, as the API sets them anyway.
export function toPayload(values) {
  const stops = values.stops.map((stop) => ({
    ...withoutKey(stop),
    label: text(stop.label),
    address: text(stop.address),
    city: text(stop.city),
    note: text(stop.note),
  }));
  const firstStop = stops[0];
  const stopSlots = sortSlots(stops.flatMap((stop) => stop.opening_hours));
  const fullyVegan = values.vegan_status === "FULLY_VEGAN";
  const temporarilyClosed = values.operating_status === "TEMPORARILY_CLOSED";
  const surcharge = values.no_hot_drinks
    ? ""
    : values.plant_milk_surcharge.trim().replace(",", ".");
  // Known only when answered: no hot drinks, or a price (as the API assumes)
  let servesHotDrinks = null;
  if (!fullyVegan && values.no_hot_drinks) servesHotDrinks = false;
  else if (!fullyVegan && surcharge) servesHotDrinks = true;
  return {
    name: values.name.trim(),
    latitude: firstStop ? firstStop.latitude : values.latitude,
    longitude: firstStop ? firstStop.longitude : values.longitude,
    address: firstStop ? firstStop.address : text(values.address),
    city: firstStop ? firstStop.city || text(values.city) : text(values.city),
    country: text(values.country),
    description: text(values.description),
    vegan_status: values.vegan_status,
    vegan_options_details: text(values.vegan_options_details),
    has_gluten_free_options: values.has_gluten_free_options,
    tags: values.tags,
    service_options: values.service_options,
    plant_milk_surcharge: fullyVegan || !surcharge ? null : Number(surcharge),
    serves_hot_drinks: servesHotDrinks,
    has_storefront: values.has_storefront,
    service_area: values.has_storefront ? null : text(values.service_area),
    opening_hours: firstStop
      ? stopSlots.length
        ? stopSlots
        : null
      : values.opening_hours.length
        ? values.opening_hours
        : null,
    opening_hours_note: text(values.opening_hours_note),
    stops: firstStop ? stops : null,
    phone: text(values.phone),
    website: text(values.website),
    facebook: text(values.facebook),
    instagram: text(values.instagram),
    menu_url: text(values.menu_url),
    operating_status: values.operating_status,
    closed_from: temporarilyClosed ? values.closed_from || null : null,
    closed_until: temporarilyClosed ? values.closed_until || null : null,
    closure_note: text(values.closure_note),
    validated: values.validated,
  };
}

// The API rules (schemas/restaurant.py), in words, to fix before saving.
export function findProblems(payload) {
  const problems = [];
  if (!payload.name) problems.push("Le nom est obligatoire.");
  if (!payload.tags.length) problems.push("Il faut au moins un type.");
  if (
    payload.vegan_status === "VEGAN_OPTIONS" &&
    !payload.vegan_options_details
  )
    problems.push(
      "Pour un lieu avec options véganes, décrivez ces options (lesquelles, comment elles sont signalées).",
    );
  const surcharge = payload.plant_milk_surcharge;
  if (
    surcharge !== null &&
    (Number.isNaN(surcharge) || Math.abs(surcharge) > MAX_PLANT_MILK_SURCHARGE)
  )
    problems.push(
      `Le supplément lait végétal doit être un montant entre −${MAX_PLANT_MILK_SURCHARGE} et ${MAX_PLANT_MILK_SURCHARGE} €.`,
    );
  if (!payload.has_storefront) {
    if (!payload.tags.includes("caterer"))
      problems.push("Seul un traiteur peut être sans boutique.");
    if (payload.service_options.includes("dine_in"))
      problems.push(
        "Un lieu sans boutique ne peut pas proposer « Sur place ».",
      );
    if (!payload.service_area)
      problems.push("Sans boutique, la zone servie est obligatoire.");
    if (!CONTACT_FIELDS.some((field) => payload[field]))
      problems.push(
        "Sans boutique, il faut au moins un contact (téléphone, site, Facebook ou Instagram).",
      );
  }
  if (
    payload.closed_from &&
    payload.closed_until &&
    payload.closed_from > payload.closed_until
  )
    problems.push("La date de fin de fermeture est avant la date de début.");
  if (payload.stops) {
    if (!payload.tags.includes("food_truck"))
      problems.push("Seul un food truck peut avoir des emplacements.");
    if (!payload.has_storefront)
      problems.push("Un lieu sans boutique ne peut pas avoir d'emplacements.");
    if (payload.stops.length > MAX_STOPS)
      problems.push(`${MAX_STOPS} emplacements au plus.`);
  }
  const hoursError = openingHoursError(payload.opening_hours);
  if (hoursError)
    problems.push(
      payload.stops
        ? `Horaires des emplacements : ${hoursError} (il ne peut pas être à deux endroits à la fois).`
        : `Horaires : ${hoursError}.`,
    );
  return problems;
}
