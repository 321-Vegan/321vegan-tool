import { useState } from "react";
import { HiCheck, HiXMark } from "react-icons/hi2";
import styled from "styled-components";

import { S3_STORAGE_URL } from "@/utils/constants";
import { formatDate, formatDistanceFromNow } from "@/utils/helpers";

import Button from "@/ui/Button";
import Checkbox from "@/ui/Checkbox";
import Input from "@/ui/Input";
import Lightbox from "@/ui/Lightbox";
import Modal from "@/ui/Modal";
import Tag from "@/ui/Tag";
import Textarea from "@/ui/Textarea";

import {
  SUGGESTION_FIELDS,
  SUGGESTION_KINDS,
  SUGGESTION_STATUSES,
  diffSuggestionValues,
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
  grid-template-columns: 3.2rem 16rem 1fr 1.4fr;
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
`;

const DiffText = styled.div`
  overflow-wrap: anywhere;
  white-space: pre-wrap;

  & ins,
  & del {
    border-radius: var(--border-radius-tiny);
    padding: 0 0.2rem;
  }

  & ins {
    text-decoration: none;
    background-color: var(--color-green-100);
    color: var(--color-green-700);
  }

  & del {
    background-color: var(--color-red-100);
    color: var(--color-red-700);
  }

  input + &,
  textarea + & {
    margin-top: 0.6rem;
    font-size: 1.3rem;
  }
`;

const Thumbnails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;

  & button {
    padding: 0;
    border: none;
    background: none;
    cursor: zoom-in;
  }

  & img {
    display: block;
    width: 18rem;
    height: 18rem;
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
  return null;
}

/** The proposed value against the current one, removals struck out. */
function ValueDiff({ field, from, to }) {
  if (sameValue(from, to)) {
    return (
      <DiffText>
        {formatSuggestionValue(field, to)} <Tag type="silver">identique</Tag>
      </DiffText>
    );
  }
  return (
    <DiffText>
      {diffSuggestionValues(field, from, to).map((part, index) =>
        part.type === "added" ? (
          <ins key={index}>{part.text}</ins>
        ) : part.type === "removed" ? (
          <del key={index}>{part.text}</del>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </DiffText>
  );
}

function PhotoLink({ photo }) {
  const [isOpen, setIsOpen] = useState(false);
  const url = `${S3_STORAGE_URL}/${photo.path}`;
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        <img src={url} alt="" />
      </button>
      <Lightbox
        images={[{ src: url }]}
        index={isOpen ? 0 : null}
        onIndexChange={(index) => setIsOpen(index !== null)}
      />
    </>
  );
}

/**
 * One suggestion to moderate. An edit shows a row per proposed field
 * (now, proposed), each can be left out or retouched before being
 * applied.
 * */
function RestaurantSuggestionCard({
  suggestion,
  onApply,
  onReject,
  isWorking,
}) {
  const {
    kind,
    status,
    restaurant,
    duplicate_of: duplicateOf,
    changes = {},
    current_values: currentValues = {},
    photos_to_remove: photosToRemove = [],
    proposed_featured_photo: proposedFeaturedPhoto,
    current_featured_photo: currentFeaturedPhoto,
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
          <div className="head">Actuel</div>
          <div className="head">Proposé</div>
          {proposedFields.map((field) => [
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
            <Value key={`${field}-current`}>
              {field === "featured_photo_id" ? (
                <Thumbnails>
                  {currentFeaturedPhoto ? (
                    <PhotoLink photo={currentFeaturedPhoto} />
                  ) : (
                    "Aucune"
                  )}
                </Thumbnails>
              ) : field === "remove_photo_ids" ? (
                "—"
              ) : (
                formatSuggestionValue(field, currentValues?.[field])
              )}
            </Value>,
            <div key={`${field}-proposed`}>
              {field === "remove_photo_ids" ? (
                <Thumbnails>
                  {photosToRemove.map((photo) => (
                    <PhotoLink key={photo.id} photo={photo} />
                  ))}
                  {!photosToRemove.length && "Déjà retirées"}
                </Thumbnails>
              ) : field === "featured_photo_id" ? (
                <Thumbnails>
                  {proposedFeaturedPhoto ? (
                    <PhotoLink photo={proposedFeaturedPhoto} />
                  ) : (
                    "Photo retirée"
                  )}
                </Thumbnails>
              ) : (
                <>
                  {isPending && (
                    <ProposedInput
                      field={field}
                      value={values[field]}
                      onChange={(value) =>
                        setValues((prev) => ({ ...prev, [field]: value }))
                      }
                      disabled={!selected.has(field) || isWorking}
                    />
                  )}
                  <ValueDiff
                    field={field}
                    from={currentValues?.[field]}
                    to={isPending ? values[field] : changes[field]}
                  />
                </>
              )}
            </div>,
          ])}
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
