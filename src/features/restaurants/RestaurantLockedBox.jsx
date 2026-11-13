import { formatDate } from "@/utils/helpers";

import Admonition from "@/ui/Admonition";
import Button from "@/ui/Button";

import styled from "styled-components";

const LockedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2.4rem;
`;

// Shown instead of the restaurant (in the validator or its edit page) when another moderator is already on it.
function RestaurantLockedBox({
  restaurant,
  lock,
  onSkip,
  skipLabel = "Passer au suivant",
}) {
  const { locked_by, locked_at } = lock;

  return (
    <LockedContainer>
      <Admonition variation="warning" icon="warning">
        <h4>Déjà en cours par {locked_by}</h4>
        {locked_by} travaille sur « {restaurant.name} » depuis{" "}
        {formatDate(locked_at, "HH'h'mm")}. Il s'affichera ici dès qu'il sera
        libéré.
      </Admonition>
      <Button onClick={onSkip}>{skipLabel}</Button>
    </LockedContainer>
  );
}

export default RestaurantLockedBox;
