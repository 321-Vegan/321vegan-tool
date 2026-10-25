import {
  PRODUCT_STATES,
  PRODUCT_STATUSES,
  PRODUCT_TYPES,
} from "@/utils/constants";

import EditHistory from "@/ui/EditHistory";
import Spinner from "@/ui/Spinner";
import { useProductHistory } from "./useProductHistory";

const FIELD_LABELS = {
  ean: "EAN",
  name: "Dénomination",
  description: "Description",
  problem_description: "Problèmes",
  brand_name: "Marque",
  status: "Statut",
  product_type: "Type",
  biodynamic: "Biodynamique",
  state: "État",
  has_non_vegan_old_receipe: "Ancienne recette non vegan",
  image: "Photo",
  brand_answer: "Réponse de la marque",
  interesting_product_id: "Vegandex",
};

function formatValue(field, value) {
  if (value === null || value === undefined || value === "") return "—";
  switch (field) {
    case "status":
      return PRODUCT_STATUSES[value]?.label || value;
    case "state":
      return PRODUCT_STATES[value]?.label || value;
    case "product_type":
      return PRODUCT_TYPES[value]?.label || value;
    case "biodynamic":
    case "has_non_vegan_old_receipe":
      return value ? "Oui" : "Non";
    // The replaced files are deleted, only their presence is meaningful
    case "image":
    case "brand_answer":
      return "Photo";
    case "interesting_product_id":
      return `Fiche #${value}`;
    default:
      return String(value);
  }
}

// Creation and changes of a product, from the backoffice or the app.
function ProductHistory({ productId }) {
  const { isPending, history } = useProductHistory(productId);

  if (isPending) return <Spinner />;

  return (
    <EditHistory
      history={history}
      labels={FIELD_LABELS}
      formatValue={formatValue}
      // Shown by its name
      hiddenFields={["brand_id"]}
      unknownAuthor="un client API ou un compte supprimé"
    />
  );
}

export default ProductHistory;
