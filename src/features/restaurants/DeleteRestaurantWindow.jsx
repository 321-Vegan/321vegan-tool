import { useState } from "react";
import styled from "styled-components";

import Button from "@/ui/Button";
import Heading from "@/ui/Heading";
import Textarea from "@/ui/Textarea";

const StyledDeleteWindow = styled.div`
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

// Deleting a pending restaurant refuses it: the reason is shown to its
// creator in the app, with the restaurants they created.
function DeleteRestaurantWindow({
  restaurant,
  name = restaurant.name,
  onDelete,
  onCloseModal,
  disabled,
}) {
  const [reason, setReason] = useState("");
  const isPending = !restaurant.validated;

  function handleDelete() {
    onDelete(isPending ? reason : undefined);
    onCloseModal?.();
  }

  return (
    <StyledDeleteWindow>
      <Heading as="h3">
        {isPending ? "Refuser ce lieu" : "Supprimer un lieu"}
      </Heading>
      <p>
        {isPending
          ? `"${name}" ne sera pas publié. Son auteur·ice verra le refus dans ses contributions.`
          : `Êtes-vous sûr de vouloir supprimer "${name}" ? Il ne sera plus visible dans l'appli.`}
      </p>
      {isPending && (
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motif du refus, visible par l'auteur·ice"
          maxLength={500}
        />
      )}
      <Actions>
        <Button
          $variation="secondary"
          disabled={disabled}
          onClick={() => onCloseModal?.()}
        >
          Annuler
        </Button>
        <Button $variation="danger" disabled={disabled} onClick={handleDelete}>
          {isPending ? "Refuser" : "Supprimer"}
        </Button>
      </Actions>
    </StyledDeleteWindow>
  );
}

export default DeleteRestaurantWindow;
