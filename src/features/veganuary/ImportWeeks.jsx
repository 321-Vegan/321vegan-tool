import { useState } from "react";

import { validateWeek } from "./validateWeek";
import { useSaveVeganuaryWeek } from "./useSaveVeganuaryWeek";

import Button from "@/ui/Button";
import ButtonGroup from "@/ui/ButtonGroup";
import FileInput from "@/ui/FileInput";
import Heading from "@/ui/Heading";
import Modal from "@/ui/Modal";

import { HiOutlineArrowUpTray } from "react-icons/hi2";
import styled from "styled-components";

const StyledImport = styled.div`
  width: 60rem;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;

  & > p {
    color: var(--color-grey-500);
  }
`;

const Files = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const File = styled.li`
  & strong {
    color: ${(props) =>
      props.$valid ? "var(--color-green-700)" : "var(--color-red-700)"};
  }

  & ul {
    margin-top: 0.4rem;
    padding-left: 1.6rem;
    font-size: 1.3rem;
    color: var(--color-red-700);
  }
`;

// Reads [file] and checks it as the app would: its week, or why it can't be
// sent.
async function readWeek(file) {
  let content;
  try {
    content = JSON.parse(await file.text());
  } catch (error) {
    return { file, errors: [{ path: "JSON", message: error.message }] };
  }
  return { file, content, errors: validateWeek(content) };
}

function ImportForm({ onCloseModal }) {
  const [weeks, setWeeks] = useState([]);
  const { isSaving, saveWeek } = useSaveVeganuaryWeek();
  const valid = weeks.filter((week) => week.errors.length === 0);

  async function handleFiles(e) {
    setWeeks(await Promise.all([...e.target.files].map(readWeek)));
  }

  async function handleSend() {
    try {
      // One after the other: a failure stops there, with its message
      for (const week of valid) await saveWeek(week.content);
      onCloseModal?.();
    } catch {
      // Already told by the save's toast
    }
  }

  return (
    <StyledImport>
      <Heading as="h3">Importer des semaines</Heading>
      <p>
        Les fichiers weekN.json de l&apos;app (lib/assets/veganuary/). Une
        semaine déjà sur l&apos;API est remplacée. Les apps téléchargent le
        nouveau contenu à leur prochaine ouverture du Veganuary.
      </p>

      <FileInput
        accept=".json,application/json"
        multiple
        onChange={handleFiles}
      />

      {weeks.length > 0 && (
        <Files>
          {weeks.map(({ file, content, errors }) => (
            <File key={file.name} $valid={errors.length === 0}>
              <strong>
                {errors.length === 0
                  ? `✓ ${file.name} : semaine ${content.number}, ${content.days.length} jours`
                  : `✗ ${file.name} : ${errors.length} erreur${errors.length > 1 ? "s" : ""}`}
              </strong>
              {errors.length > 0 && (
                <ul>
                  {errors.slice(0, 10).map((error, i) => (
                    <li key={i}>
                      {error.path} : {error.message}
                    </li>
                  ))}
                  {errors.length > 10 && <li>…</li>}
                </ul>
              )}
            </File>
          ))}
        </Files>
      )}

      <ButtonGroup $variation="end">
        <Button $variation="secondary" onClick={onCloseModal}>
          Annuler
        </Button>
        <Button disabled={valid.length === 0 || isSaving} onClick={handleSend}>
          {valid.length > 1
            ? `Envoyer les ${valid.length} semaines`
            : "Envoyer la semaine"}
        </Button>
      </ButtonGroup>
    </StyledImport>
  );
}

function ImportWeeks() {
  return (
    <Modal>
      <Modal.Open opens="veganuary-import">
        <Button>
          <HiOutlineArrowUpTray />
          Importer
        </Button>
      </Modal.Open>
      <Modal.Window name="veganuary-import">
        <ImportForm />
      </Modal.Window>
    </Modal>
  );
}

export default ImportWeeks;
