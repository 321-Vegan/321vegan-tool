import styled from "styled-components";

import { formatDate, formatDistanceFromNow } from "@/utils/helpers";

import NoDataItem from "@/ui/NoDataItem";
import Tag from "@/ui/Tag";
import { SUGGESTION_FIELDS, formatSuggestionValue } from "./suggestionFields";

const List = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const Entry = styled.li`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-bottom: 1.6rem;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.3rem;
  color: var(--color-grey-500);
`;

const Changes = styled.div`
  display: grid;
  grid-template-columns: 18rem 1fr 2rem 1fr;
  gap: 0.4rem 1.2rem;
  font-size: 1.4rem;
`;

const Before = styled.span`
  color: var(--color-grey-500);
  text-decoration: line-through;
`;

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
  if (!history.length) return <NoDataItem>Aucune modification</NoDataItem>;

  return (
    <List>
      {history.map((edit) => (
        <Entry key={edit.id}>
          <Meta>
            <span>
              {formatDate(edit.created_at)} (
              {formatDistanceFromNow(edit.created_at)})
            </span>
            <span>
              par{" "}
              {edit.user_nickname ||
                (edit.user_id ? `#${edit.user_id}` : "un compte supprimé")}
            </span>
            {edit.suggestion_id && (
              <Tag type="blue">Proposition #{edit.suggestion_id}</Tag>
            )}
          </Meta>
          <Changes>
            {Object.keys(edit.after).map((field) => [
              <strong key={`${field}-label`}>
                {FIELD_LABELS[field] || field}
              </strong>,
              <Before key={`${field}-before`}>
                {formatValue(field, edit.before[field])}
              </Before>,
              <span key={`${field}-arrow`}>&rarr;</span>,
              <span key={`${field}-after`}>
                {formatValue(field, edit.after[field])}
              </span>,
            ])}
          </Changes>
        </Entry>
      ))}
    </List>
  );
}

export default RestaurantHistory;
