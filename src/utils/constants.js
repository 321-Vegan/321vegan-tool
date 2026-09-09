export const API_URL = import.meta.env.VITE_API_URL;
export const S3_STORAGE_URL = import.meta.env.VITE_S3_STORAGE_URL;
export const PAGE_SIZE = 5;

export const USER_AVATARS = {
  default: "default-avatar.jpg",
  canard: "canard.png",
  cochon: "cochon.png",
  lapin: "lapin.png",
  mouton: "mouton.png",
  poisson: "poisson.png",
  poule: "poule.png",
  vache: "vache.png",
  ver: "ver.png",
  chat: "chat.png",
};

export const USER_ROLES = {
  user: { color: "silver", label: "Utilisateurice", roles: ["user"] },
  contributor: {
    color: "yellow",
    label: "Contributeurice",
    roles: ["user", "contributor"],
  },
  admin: {
    color: "blue",
    label: "Administrateurice",
    roles: ["user", "contributor", "admin"],
  },
};

export const PRODUCT_STATES = {
  CREATED: { color: "silver", label: "À vérifier", role: "user" },
  NEED_CONTACT: { color: "yellow", label: "À contacter", role: "contributor" },
  WAITING_BRAND_REPLY: {
    color: "blue",
    label: "Contacté",
    role: "contributor",
  },
  TO_INVESTIGATE: {
    color: "orange",
    label: "Cosmétique à vérif",
    role: "contributor",
  },
  WAITING_PUBLISH: {
    color: "indigo",
    label: "À publier",
    role: "contributor",
  },
  PUBLISHED: { color: "green", label: "Publié", role: "admin" },
};

export const PRODUCT_STATUSES = {
  NOT_FOUND: { color: "silver", label: "Inconnu" },
  MAYBE_VEGAN: { color: "yellow", label: "Maybe vegan" },
  VEGAN: { color: "green", label: "Vegan" },
  NON_VEGAN: { color: "red", label: "Non vegan" },
};

export const PRODUCT_TYPES = {
  FOOD: { color: "grey", label: "Alimentaire" },
  COSMETIC: { color: "grey", label: "Cosmétique" },
  HOUSEHOLD: { color: "grey", label: "Entretien" },
};

export const INTERESTING_PRODUCT_TYPES = {
  popular: { color: "blue", label: "Populaire" },
  sponsored: { color: "yellow", label: "Sponsorisé" },
};

export const CHECKING_STATUSES = {
  PENDING: { color: "silver", label: "En attente" },
  MAYBE_VEGAN: { color: "yellow", label: "Maybe vegan" },
  VEGAN: { color: "green", label: "Vegan" },
  NON_VEGAN: { color: "red", label: "Non vegan" },
};

export const ADDITIVES_STATUSES = {
  VEGAN: { color: "green", label: "Vegan" },
  NON_VEGAN: { color: "red", label: "Carniste" },
  MAYBE_VEGAN: { color: "yellow", label: "Ça dépend" },
};

export const SHOP_REVIEWS_STATUSES = {
  PENDING: { color: "silver", label: "En attente" },
  APPROVED: { color: "green", label: "Validé" },
  REJECTED: { color: "red", label: "Rejeté" },
};
/** Used to highlight ingredients in product detail view */
export const NON_VEGAN_INGREDIENTS = [
  "egg",
  "oeuf",
  "œuf",
  "milk",
  "lait",
  "lactose",
  "lactoserum",
  "lactosérum",
  "cheese",
  "fromage",
  "emmental",
  "butter",
  "beurre",
  "cream",
  "crème",
  "creme",
  "caseine",
  "caséine",
  "gelatine",
  "gélatine",
  "fish",
  "poisson",
  "anchovies",
  "anchovy",
  "anchois",
  "meet",
  "viande",
  "beef",
  "boeuf",
  "chicken",
  "poulet",
  "bacon",
  "pork",
  "porc",
  "viel",
  "veau",
  "animal fat",
  "graisse animale",
  "animal lecithin",
  "lécithine animale",
  "rennet",
  "présure",
  "crustaceans",
  "crustacés",
  "crustaces",
  "mollusc",
  "mollusque",
  "cochenille",
  "honey",
  "miel",
  "beeswax",
  "cire d'abeille",
  "propolis",
  "collagen",
  "collagène",
  "collagene",
];

export const MAYBE_VEGAN_INGREDIENTS = [
  "natural flavor",
  "natural flavour",
  "arôme naturel",
  "arômes naturels",
  "flavour",
  "arôme",
  "additive",
  "additif",
  "additives",
  "additifs",
  "vitamin d",
  "vitamine d",
];

/**
 * Used to highlight ingredients in product detail view
 *
 * Array built from e_numbers database
 */
export const NON_VEGAN_E_NUMBERS = [
  "E1105",
  "E441",
  "E542",
  "E901",
  "E904",
  "E910",
  "E913",
  "E966",
  "E120",
];

export const MAYBE_VEGAN_E_NUMBERS = [
  "E170",
  "E628",
  "E633",
  "E920",
  "E921",
  "E161g",
  "E161h",
  "E161i",
  "E161j",
  "E252",
  "E270",
  "E322",
  "E325",
  "E326",
  "E327",
  "E422",
  "E430",
  "E431",
  "E432",
  "E433",
  "E434",
  "E435",
  "E436",
  "E442",
  "E470a",
  "E470b",
  "E471",
  "E472a",
  "E472b",
  "E472c",
  "E472d",
  "E472e",
  "E472f",
  "E477",
  "E483",
  "E495",
  "E640",
  "E473",
  "E478",
  "E491",
  "E570",
  "E585",
  "E474",
  "E479b",
  "E492",
  "E572",
  "E627",
  "E475",
  "E481",
  "E493",
  "E631",
  "E476",
  "E482",
  "E494",
  "E635",
  "E341",
];
