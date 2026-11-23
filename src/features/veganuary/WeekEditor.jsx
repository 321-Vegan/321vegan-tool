import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { useGoBack } from "@/hooks/useGoBack";

import { useVeganuaryWeeks } from "./useVeganuaryWeeks";
import { useSaveVeganuaryWeek } from "./useSaveVeganuaryWeek";
import { validateWeek } from "./validateWeek";
import { downloadWeek, setAt } from "./weekFile";
import WeekTextFields from "./WeekTextFields";

import Admonition from "@/ui/Admonition";
import Button from "@/ui/Button";
import ButtonGroup from "@/ui/ButtonGroup";
import ButtonText from "@/ui/ButtonText";
import Empty from "@/ui/Empty";
import Heading from "@/ui/Heading";
import Row from "@/ui/Row";
import Spinner from "@/ui/Spinner";
import Textarea from "@/ui/Textarea";

import { HiArrowDownTray } from "react-icons/hi2";
import styled from "styled-components";

const JsonArea = styled(Textarea)`
  height: 70vh;
  font-family: monospace;
  font-size: 1.3rem;
  white-space: pre;
`;

const Errors = styled.ul`
  padding-left: 1.6rem;
  list-style: disc;
`;

// The week being edited, from the API: its texts in a form, or its whole
// JSON (to add or remove pages, blocks...), checked as the app reads it
// before being saved.
function WeekEditor() {
  const number = Number(useParams().weekNumber);
  const goBack = useGoBack();
  const { isPending, weeks } = useVeganuaryWeeks();
  const { isSaving, saveWeek } = useSaveVeganuaryWeek();
  const saved = weeks?.find((week) => week.number === number)?.content;

  // Null until a change: the saved week is shown
  const [draft, setDraft] = useState(null);
  const [tab, setTab] = useState("texts");
  // The JSON tab's text, kept while it can't be read
  const [json, setJson] = useState(null);
  const [jsonError, setJsonError] = useState(null);

  const week = draft ?? saved;
  const errors = useMemo(
    () => (week ? validateWeek(week, { number }) : []),
    [week, number],
  );

  if (isPending) return <Spinner />;
  if (!saved)
    return <Empty message={`La semaine ${number} n'est pas sur l'API.`} />;

  const changed = draft !== null;

  function handleText(path, value) {
    setDraft(setAt(week, path, value));
  }

  function handleJson(e) {
    setJson(e.target.value);
    try {
      setDraft(JSON.parse(e.target.value));
      setJsonError(null);
    } catch (error) {
      setJsonError(error.message);
    }
  }

  function showTab(name) {
    setTab(name);
    setJson(JSON.stringify(week, null, 2));
    setJsonError(null);
  }

  async function handleSave() {
    try {
      await saveWeek(week);
      setDraft(null);
    } catch {
      // Already told by the save's toast
    }
  }

  function handleReset() {
    setDraft(null);
    setJson(JSON.stringify(saved, null, 2));
    setJsonError(null);
  }

  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">
          Semaine {number} · {week.title}
        </Heading>
        <ButtonText onClick={goBack}>&larr; Retour</ButtonText>
      </Row>

      <Admonition variation="info" icon="hint">
        Les apps téléchargent la semaine enregistrée à leur prochaine ouverture
        du Veganuary. Pensez à reporter les modifications dans le repo de
        l&apos;app (« Télécharger le JSON » → lib/assets/veganuary/), qui reste
        la référence. Corriger des textes ne pose pas de problème ; évitez de
        réorganiser les pages d&apos;un jour pendant que des gens le font.
      </Admonition>

      <Row type="horizontal">
        <ButtonGroup>
          <Button
            $variation={tab === "texts" ? "primary" : "secondary"}
            disabled={tab === "json" && jsonError !== null}
            onClick={() => showTab("texts")}
          >
            Textes
          </Button>
          <Button
            $variation={tab === "json" ? "primary" : "secondary"}
            onClick={() => showTab("json")}
          >
            JSON
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Button $variation="secondary" onClick={() => downloadWeek(week)}>
            <HiArrowDownTray /> Télécharger le JSON
          </Button>
          <Button
            $variation="secondary"
            disabled={!changed || isSaving}
            onClick={handleReset}
          >
            Annuler les modifications
          </Button>
          <Button
            disabled={
              !changed || errors.length > 0 || jsonError !== null || isSaving
            }
            onClick={handleSave}
          >
            Enregistrer
          </Button>
        </ButtonGroup>
      </Row>

      {(jsonError || errors.length > 0) && (
        <Admonition variation="danger">
          {jsonError ? (
            `JSON illisible : ${jsonError}`
          ) : (
            <>
              La semaine ne peut pas être enregistrée :
              <Errors>
                {errors.slice(0, 20).map((error, i) => (
                  <li key={i}>
                    {error.path} : {error.message}
                  </li>
                ))}
                {errors.length > 20 && <li>…</li>}
              </Errors>
            </>
          )}
        </Admonition>
      )}

      {tab === "texts" ? (
        <WeekTextFields week={week} onChange={handleText} />
      ) : (
        <JsonArea value={json ?? ""} onChange={handleJson} spellCheck={false} />
      )}
    </>
  );
}

export default WeekEditor;
