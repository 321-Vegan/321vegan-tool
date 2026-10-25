import EditHistory from "@/ui/EditHistory";
import Tag from "@/ui/Tag";
import { SUGGESTION_FIELDS, formatSuggestionValue } from "./suggestionFields";

const FIELD_LABELS = {
  ...Object.fromEntries(
    Object.entries(SUGGESTION_FIELDS).map(([field, { label }]) => [
      field,
      label,
    ]),
  ),
  validated: "Validé",
};

function formatValue(field, value) {
  if (field === "validated") return value ? "Oui" : "Non";
  return formatSuggestionValue(field, value);
}

// Changes applied to a restaurant, directly or through a suggestion.
function RestaurantHistory({ history }) {
  return (
    <EditHistory
      history={history}
      labels={FIELD_LABELS}
      formatValue={formatValue}
      renderTags={(edit) =>
        edit.suggestion_id && (
          <Tag type="blue">Proposition #{edit.suggestion_id}</Tag>
        )
      }
    />
  );
}

export default RestaurantHistory;
