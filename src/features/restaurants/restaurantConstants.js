// Mirrors the API enums (app/models/restaurant.py).
export const RESTAURANT_TAGS = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Café" },
  { value: "bakery", label: "Boulangerie" },
  { value: "food_truck", label: "Food truck" },
  { value: "fast_food", label: "Fast food" },
  { value: "ice_cream", label: "Glacier" },
  { value: "bar", label: "Bar" },
  { value: "caterer", label: "Traiteur" },
  { value: "hotel", label: "Hôtel" },
  { value: "guesthouse", label: "Chambre d'hôtes" },
  { value: "hostel", label: "Auberge de jeunesse" },
];

export const SERVICE_OPTIONS = [
  { value: "dine_in", label: "Sur place" },
  { value: "takeaway", label: "À emporter" },
  { value: "delivery", label: "Livraison" },
];

export const VEGAN_STATUSES = {
  FULLY_VEGAN: { color: "green", label: "100 % végane" },
  VEGAN_OPTIONS: { color: "yellow", label: "Options véganes" },
};

export const OPERATING_STATUSES = {
  OPEN: { color: "green", label: "Ouvert" },
  TEMPORARILY_CLOSED: { color: "yellow", label: "Fermé temporairement" },
  PERMANENTLY_CLOSED: { color: "red", label: "Fermé définitivement" },
};

export const PHOTO_KINDS = {
  PLACE: { color: "blue", label: "Lieu" },
  MENU: { color: "indigo", label: "Menu" },
};

export const PHOTO_STATUSES = {
  PENDING: { color: "silver", label: "En attente" },
  APPROVED: { color: "green", label: "Approuvée" },
  REJECTED: { color: "red", label: "Refusée" },
};

// Opening slots use 0 = monday
export const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

// A restaurant closer than this to another one is probably a duplicate
export const DUPLICATE_RADIUS_METERS = 50;
