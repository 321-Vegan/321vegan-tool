import { useState } from "react";
import { HiCheck, HiXMark } from "react-icons/hi2";
import styled from "styled-components";

import { S3_STORAGE_URL } from "@/utils/constants";
import { formatDate, formatDistanceFromNow } from "@/utils/helpers";

import Button from "@/ui/Button";
import Checkbox from "@/ui/Checkbox";
import Input from "@/ui/Input";
import Modal from "@/ui/Modal";
import Tag from "@/ui/Tag";
import Textarea from "@/ui/Textarea";

import {
  SUGGESTION_FIELDS,
  SUGGESTION_KINDS,
  SUGGESTION_STATUSES,
  formatSuggestionValue,
  sameValue,
} from "./suggestionFields";

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  padding: 2.4rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
`;

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.2rem;
`;

const Title = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
`;

const Meta = styled.p`
  font-size: 1.3rem;
  color: var(--color-grey-500);
`;

const Comment = styled.blockquote`
  padding: 1rem 1.4rem;
  border-left: 3px solid var(--color-grey-300);
  color: var(--color-grey-700);
  white-space: pre-wrap;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 3.2rem 16rem 1fr 1fr 1.4fr;
  gap: 1rem 1.6rem;
  align-items: start;
  font-size: 1.4rem;

  & > .head {
    font-weight: 600;
    color: var(--color-grey-500);
    text-transform: uppercase;
    font-size: 1.2rem;
  }
`;

const Value = styled.div`
  overflow-wrap: anywhere;
  color: ${(props) => (props.$muted ? "var(--color-grey-400)" : "inherit")};
`;

const Thumbnails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;

  & img {
    width: 8rem;
    height: 8rem;
    object-fit: cover;
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--color-grey-200);
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
`;

const RejectForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  width: 48rem;
`;

function RejectWindow({ onReject, onCloseModal, disabled }) {
  const [reason, setReason] = useState("");
  return (
    <RejectForm>
      <Title>Rejeter la proposition</Title>
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Motif (facultatif), visible par l'auteur·ice"
      />
      <Actions>
        <Button $variation="secondary" onClick={() => onCloseModal?.()}>
          Annuler
        </Button>
        <Button
          $variation="danger"
          disabled={disabled}
          onClick={() => onReject(reason, () => onCloseModal?.())}
        >
          Rejeter
        </Button>
      </Actions>
    </RejectForm>
  );
}

function ProposedInput({ field, value, onChange, disabled }) {
  const { input } = SUGGESTION_FIELDS[field] || {};
  if (input === "textarea") {
    return (
      <Textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
      />
    );
  }
  if (input) {
    return (
      <Input
        type={input}
        step={input === "number" ? "any" : undefined}
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return onChange(null);
          onChange(input === "number" ? Number(raw) : raw);
        }}
        disabled={disabled}
      />
    );
  }
  return <Value>{formatSuggestionValue(field, value)}</Value>;
}

/**
 * One suggestion to moderate. An edit shows a row per proposed field
 * (before, now, proposed), each can be left out or retouched before being
 * applied.
 * */
function RestaurantSuggestionCard({ suggestion, onApply, onReject, isWorking }) {
  const {
    kind,
    status,
    restaurant,
    duplicate_of: duplicateOf,
    changes = {},
    base_values: baseValues = {},
    current_values: currentValues = {},
    photos_to_remove: photosToRemove = [],
  } = suggestion;
  const proposedFields = Object.keys(changes || {});
  const isPending = status === "PENDING";

  const [selected, setSelected] = useState(() => new Set(proposedFields));
  const [values, setValues] = useState(() => ({ ...changes }));

  function toggle(field) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  }

  function handleApply() {
    if (kind !== "EDIT") return onApply({ id: suggestion.id });
    const fields = proposedFields.filter((f) => selected.has(f));
    const retouched = Object.fromEntries(
      fields
        .filter((f) => !sameValue(values[f], changes[f]))
        .map((f) => [f, values[f]]),
    );
    onApply({ id: suggestion.id, fields, values: retouched });
  }

  const applyLabel = {
    EDIT: "Appliquer la sélection",
    NO_VEGAN_OPTION: "Retirer de la carte",
    DUPLICATE: "Fusionner",
  }[kind];

  return (
    <Card>
      <Header>
        <Tag type={SUGGESTION_KINDS[kind].color}>
          {SUGGESTION_KINDS[kind].label}
        </Tag>
        <Title>
          {restaurant.name}
          {restaurant.city && ` · ${restaurant.city}`}
        </Title>
        {!isPending && (
          <Tag type={SUGGESTION_STATUSES[status].color}>
            {SUGGESTION_STATUSES[status].label}
          </Tag>
        )}
      </Header>
      <Meta>
        Par {suggestion.user_nickname || "Anonyme"}, le{" "}
        {formatDate(suggestion.created_at)} (
        {formatDistanceFromNow(suggestion.created_at)})
      </Meta>
      {suggestion.comment && <Comment>{suggestion.comment}</Comment>}

      {kind === "NO_VEGAN_OPTION" && (
        <p>
          Le lieu n&apos;aurait plus d&apos;option végane : l&apos;appliquer le
          retire de la carte (ses avis et photos sont conservés).
        </p>
      )}
      {kind === "DUPLICATE" && duplicateOf && (
        <p>
          Doublon de <strong>{duplicateOf.name}</strong>
          {duplicateOf.city && ` (${duplicateOf.city})`} : fusionner déplace les
          avis et les photos vers ce lieu, puis retire celui-ci de la carte.
        </p>
      )}

      {kind === "EDIT" && (
        <Grid>
          <div className="head" />
          <div className="head">Champ</div>
          <div className="head">Avant</div>
          <div className="head">Actuel</div>
          <div className="head">Proposé</div>
          {proposedFields.map((field) => {
            const changedSince = !sameValue(
              currentValues?.[field],
              baseValues?.[field],
            );
            return [
              <Checkbox
                key={`${field}-check`}
                name={`suggestion-${suggestion.id}-${field}`}
                checked={selected.has(field)}
                onChange={() => toggle(field)}
                disabled={!isPending || isWorking}
              />,
              <div key={`${field}-label`}>
                {SUGGESTION_FIELDS[field]?.label || field}
              </div>,
              <Value key={`${field}-base`} $muted>
                {field === "remove_photo_ids"
                  ? "—"
                  : formatSuggestionValue(field, baseValues?.[field])}
              </Value>,
              <Value key={`${field}-current`}>
                {field === "remove_photo_ids"
                  ? "—"
                  : formatSuggestionValue(field, currentValues?.[field])}
                {changedSince && field !== "remove_photo_ids" && (
                  <>
                    {" "}
                    <Tag type="orange">a changé</Tag>
                  </>
                )}
              </Value>,
              <div key={`${field}-proposed`}>
                {field === "remove_photo_ids" ? (
                  <Thumbnails>
                    {photosToRemove.map((photo) => (
                      <a
                        key={photo.id}
                        href={`${S3_STORAGE_URL}/${photo.path}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img src={`${S3_STORAGE_URL}/${photo.path}`} alt="" />
                      </a>
                    ))}
                    {!photosToRemove.length && "Déjà retirées"}
                  </Thumbnails>
                ) : isPending ? (
                  <ProposedInput
                    field={field}
                    value={values[field]}
                    onChange={(value) =>
                      setValues((prev) => ({ ...prev, [field]: value }))
                    }
                    disabled={!selected.has(field) || isWorking}
                  />
                ) : (
                  <Value>{formatSuggestionValue(field, changes[field])}</Value>
                )}
              </div>,
            ];
          })}
        </Grid>
      )}

      {!isPending && suggestion.rejection_reason && (
        <Meta>Motif du rejet : {suggestion.rejection_reason}</Meta>
      )}

      {isPending && (
        <Modal>
          <Actions>
            <Modal.Open opens="reject">
              <Button $variation="danger" disabled={isWorking}>
                <HiXMark /> Rejeter
              </Button>
            </Modal.Open>
            <Button
              onClick={handleApply}
              disabled={isWorking || (kind === "EDIT" && selected.size === 0)}
            >
              <HiCheck /> {applyLabel}
            </Button>
          </Actions>
          <Modal.Window name="reject">
            <RejectWindow
              disabled={isWorking}
              onReject={(reason, close) =>
                onReject(
                  { id: suggestion.id, rejectionReason: reason },
                  { onSuccess: close },
                )
              }
            />
          </Modal.Window>
        </Modal>
      )}
    </Card>
  );
}

export default RestaurantSuggestionCard;
