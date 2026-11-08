import { useState } from "react";
import styled from "styled-components";

import Button from "@/ui/Button";
import Heading from "@/ui/Heading";
import Textarea from "@/ui/Textarea";

const StyledSetAsideWindow = styled.div`
  width: 48rem;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;

  & p {
    color: var(--color-grey-500);
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
`;

// A pending restaurant that can't be validated yet (the place must be
// contacted...) leaves the validator until its issue is cleared.
function SetAsideRestaurantWindow({ name, onSetAside, onCloseModal, disabled }) {
  const [issue, setIssue] = useState("");

  function handleSetAside() {
    onSetAside(issue.trim());
    onCloseModal?.();
  }

  return (
    <StyledSetAsideWindow>
      <Heading as="h3">Mettre ce lieu de côté</Heading>
      <p>
        &quot;{name}&quot; ne sera plus proposé à la validation. Il reste dans
        la page des lieux (filtre « Mis de côté ») : effacez le problème pour le
        remettre dans le circuit.
      </p>
      <Textarea
        value={issue}
        onChange={(e) => setIssue(e.target.value)}
        placeholder="Ce qui bloque : lieu à contacter, info à vérifier… (visible des modérateur·ices seulement)"
        maxLength={1000}
      />
      <Actions>
        <Button
          $variation="secondary"
          disabled={disabled}
          onClick={() => onCloseModal?.()}
        >
          Annuler
        </Button>
        <Button
          disabled={disabled || !issue.trim()}
          onClick={handleSetAside}
        >
          Mettre de côté
        </Button>
      </Actions>
    </StyledSetAsideWindow>
  );
}

export default SetAsideRestaurantWindow;
