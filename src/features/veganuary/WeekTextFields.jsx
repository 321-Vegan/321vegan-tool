import { useState } from "react";

import AutoResizeTextarea from "@/ui/AutoResizeTextarea";

import { imageUrl, isImagePath } from "./weekFile";

import { HiChevronDown, HiChevronRight } from "react-icons/hi2";
import styled from "styled-components";

// Every text of a week, to correct, laid out like the course: days, their
// pages and blocks. What changes the structure (kinds of pages, links to the
// app, numbers) is left to the JSON tab.

// Not texts to rewrite: changing them changes what the app shows
const STRUCTURE_KEYS = new Set([
  "type",
  "target",
  "icon",
  "result",
  "id",
  "number",
  "columns",
  "cover",
]);

const TYPE_LABELS = {
  info: "Page",
  myth: "Idée reçue du jour",
  recipe: "Recette",
  quiz: "Quiz",
  text: "Texte",
  bullets: "Liste",
  image: "Image",
  callout: "Encadré",
  app_link: "Lien vers l'app",
  grid: "Cartes",
};

// Of each element of a list, or of an object
const KEY_LABELS = {
  title: "Titre",
  text: "Texte",
  label: "Libellé",
  question: "Question",
  explanation: "Explication",
  caption: "Légende",
  servings: "Portions",
  steps: "Étape",
  blocks: "Bloc",
  sources: "Source",
  recap: "Récap",
  bullets: "Puce",
  choices: "Choix",
  items: "Élément",
  ingredients: "Ingrédient",
  answer: "Réponse",
  details: "Détails",
  credit: "Crédit",
  links: "Lien",
  name: "Nom",
};

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const shorten = (text) =>
  text.length > 70 ? `${text.slice(0, 70).trimEnd()}…` : text;

// The title of an object's section: what it is, and its first words
function summary(value, fallback) {
  if (Number.isInteger(value.number) && Array.isArray(value.steps))
    return `Jour ${value.number}`;
  if (value.id && value.label) return `Idée reçue · ${shorten(value.label)}`;
  const name =
    value.title ?? value.question ?? value.label ?? value.text ?? value.name;
  const kind = TYPE_LABELS[value.type] ?? fallback;
  return typeof name === "string" ? `${kind} · ${shorten(name)}` : kind;
}

const hasText = (value) =>
  typeof value === "string" ||
  (Array.isArray(value) && value.some(hasText)) ||
  (value !== null &&
    typeof value === "object" &&
    Object.entries(value).some(
      ([key, child]) => !STRUCTURE_KEYS.has(key) && hasText(child),
    ));

// Only texts, or lists of texts (a paragraph, a list, a source): shown
// right away in its page, not behind a click of its own
const isSimple = (value) =>
  Object.entries(value).every(
    ([key, child]) =>
      STRUCTURE_KEYS.has(key) ||
      typeof child !== "object" ||
      child === null ||
      (Array.isArray(child) && child.every((c) => typeof c !== "object")),
  );

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.2rem 1.6rem;
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-50);

  & > strong {
    font-size: 1.3rem;
    color: var(--color-grey-600);
  }
`;

const Section = styled.div`
  border-left: 2px solid var(--color-grey-200);
  padding-left: 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Toggle = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: none;
  border: none;
  text-align: left;
  font-weight: 600;
  color: var(--color-grey-700);

  & svg {
    flex-shrink: 0;
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-grey-500);
  }
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  & span {
    font-size: 1.2rem;
    font-weight: 500;
    color: var(--color-grey-500);
  }
`;

const FieldRow = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: flex-start;
`;

// An image of the bucket, to see which one a path is
const Preview = styled.img`
  width: 8rem;
  height: 8rem;
  object-fit: contain;
  flex-shrink: 0;
  background-color: white;
  border-radius: var(--border-radius-sm);
`;

const Text = styled(AutoResizeTextarea)`
  min-height: 4rem;
  font-size: 1.4rem;
`;

// A section that opens on demand: a week has hundreds of texts, only the
// open ones are drawn
function Collapsible({ title, children, initiallyOpen = false }) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <Section>
      <Toggle type="button" onClick={() => setOpen((open) => !open)}>
        {open ? <HiChevronDown /> : <HiChevronRight />}
        {title}
      </Toggle>
      {open && children}
    </Section>
  );
}

function Node({ value, path, label, onChange }) {
  if (typeof value === "string") {
    const preview = isImagePath(value) ? imageUrl(value) : null;
    return (
      <Field>
        <span>{label}</span>
        <FieldRow>
          {preview && <Preview src={preview} alt="" loading="lazy" />}
          <Text
            value={value}
            onChange={(e) => onChange(path, e.target.value)}
          />
        </FieldRow>
      </Field>
    );
  }

  if (Array.isArray(value))
    return value.map((child, i) =>
      hasText(child) ? (
        <Node
          key={i}
          value={child}
          path={[...path, i]}
          label={
            typeof child === "string"
              ? `${label} ${i + 1}`
              : summary(child, `${label} ${i + 1}`)
          }
          onChange={onChange}
        />
      ) : null,
    );

  if (value !== null && typeof value === "object") {
    const fields = Object.entries(value).filter(
      ([key, child]) => !STRUCTURE_KEYS.has(key) && hasText(child),
    );
    const Wrapper = isSimple(value) ? SimpleGroup : Collapsible;
    return (
      <Wrapper title={label}>
        {fields.map(([key, child]) => (
          <Node
            key={key}
            value={child}
            path={[...path, key]}
            label={
              isObject(child)
                ? summary(child, KEY_LABELS[key] ?? key)
                : (KEY_LABELS[key] ?? key)
            }
            onChange={onChange}
          />
        ))}
      </Wrapper>
    );
  }

  return null;
}

function SimpleGroup({ title, children }) {
  return (
    <Group>
      <strong>{title}</strong>
      {children}
    </Group>
  );
}

// [onChange] gets the path of the text changed (keys and indexes) and its
// new value.
function WeekTextFields({ week, onChange }) {
  return (
    <Section>
      <Node
        value={week.title}
        path={["title"]}
        label="Titre"
        onChange={onChange}
      />
      {week.myths?.length > 0 && (
        <Collapsible title="Idées reçues">
          <Node
            value={week.myths}
            path={["myths"]}
            label="Idée reçue"
            onChange={onChange}
          />
        </Collapsible>
      )}
      <Node
        value={week.days}
        path={["days"]}
        label="Jour"
        onChange={onChange}
      />
    </Section>
  );
}

export default WeekTextFields;
