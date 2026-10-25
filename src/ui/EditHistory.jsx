import styled from "styled-components";

import { formatDate, formatDistanceFromNow } from "@/utils/helpers";

import NoDataItem from "@/ui/NoDataItem";
import Tag from "@/ui/Tag";

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
  word-break: break-word;
`;

const Before = styled.span`
  color: var(--color-grey-500);
  text-decoration: line-through;
`;

/**
 * History entries {before, after, created_at, user_id, user_nickname}, newest
 * first, each change shown as "field: before → after". An entry with an empty
 * before is a creation.
 *
 * @param {Object} labels: field → label, other fields shown by their name
 * @param {Function} formatValue: (field, value) => text
 * @param {Array} hiddenFields: recorded but not shown (e.g. an id along its name)
 * @param {Function} renderTags: optional (edit) => extra tags
 * @param {String} unknownAuthor: shown when the entry has no user
 * */
function EditHistory({
  history,
  labels,
  formatValue,
  hiddenFields = [],
  renderTags,
  unknownAuthor = "un compte supprimé",
}) {
  if (!history.length) return <NoDataItem>Aucune modification</NoDataItem>;

  return (
    <List>
      {history.map((edit) => {
        const isCreation = Object.keys(edit.before).length === 0;
        const fields = Object.keys(edit.after).filter(
          (field) => !hiddenFields.includes(field),
        );
        return (
          <Entry key={edit.id}>
            <Meta>
              <span>
                {formatDate(edit.created_at)} (
                {formatDistanceFromNow(edit.created_at)})
              </span>
              <span>
                par{" "}
                {edit.user_nickname ||
                  (edit.user_id ? `#${edit.user_id}` : unknownAuthor)}
              </span>
              {isCreation && <Tag type="green">Création</Tag>}
              {renderTags?.(edit)}
            </Meta>
            <Changes>
              {fields.map((field) => [
                <strong key={`${field}-label`}>
                  {labels[field] || field}
                </strong>,
                <Before key={`${field}-before`}>
                  {isCreation ? "" : formatValue(field, edit.before[field])}
                </Before>,
                <span key={`${field}-arrow`}>{isCreation ? "" : "→"}</span>,
                <span key={`${field}-after`}>
                  {formatValue(field, edit.after[field])}
                </span>,
              ])}
            </Changes>
          </Entry>
        );
      })}
    </List>
  );
}

export default EditHistory;
