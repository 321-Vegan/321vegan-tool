import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import Button from "@/ui/Button";
import Heading from "@/ui/Heading";
import Spinner from "@/ui/Spinner";
import ValidatorProgress from "@/ui/ValidatorProgress";

import { useRestaurantsToValidate } from "./useRestaurantsToValidate";
import { useValidateRestaurant } from "./useValidateRestaurant";
import { useDeleteRestaurant } from "./useDeleteRestaurant";
import RestaurantValidatorCard from "./RestaurantValidatorCard";

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.6rem;
  padding: 4.8rem 2.4rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  text-align: center;
`;

const EmptyText = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
`;

// Restaurants are snapshotted once loaded so validating/deleting one (which
// refetches the list) doesn't reorder or skip items mid-session.
function RestaurantValidatorTool() {
  const { isPending, restaurants } = useRestaurantsToValidate();
  const { validateRestaurant, isValidating } = useValidateRestaurant();
  const { deleteRestaurant, isDeleting } = useDeleteRestaurant();

  const [snapshot, setSnapshot] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isPending && snapshot === null) setSnapshot(restaurants);
  }, [isPending, restaurants, snapshot]);

  const advance = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  function handleRestart() {
    setSnapshot(null);
    setCurrentIndex(0);
  }

  if (isPending || snapshot === null) return <Spinner />;

  if (snapshot.length === 0) {
    return (
      <EmptyContainer>
        <Heading as="h2">Aucun restaurant à valider</Heading>
        <EmptyText>Tous les restaurants soumis ont été traités. 💚</EmptyText>
      </EmptyContainer>
    );
  }

  if (currentIndex >= snapshot.length) {
    return (
      <EmptyContainer>
        <Heading as="h2">Validation terminée</Heading>
        <EmptyText>
          Vous avez traité tous les restaurants de cette session. Merci pour
          votre contribution ! 💚
        </EmptyText>
        <Button onClick={handleRestart}>Retour</Button>
      </EmptyContainer>
    );
  }

  const currentRestaurant = snapshot[currentIndex];
  const isProcessing = isValidating || isDeleting;

  return (
    <>
      <ValidatorProgress
        current={currentIndex}
        total={snapshot.length}
        onSkip={advance}
        onQuit={() => setCurrentIndex(snapshot.length)}
        label="Restaurant"
      />
      <RestaurantValidatorCard
        key={currentRestaurant.id}
        restaurant={currentRestaurant}
        isProcessing={isProcessing}
        onValidate={(fields) =>
          validateRestaurant(
            { id: currentRestaurant.id, ...fields },
            { onSuccess: advance },
          )
        }
        onDelete={() =>
          deleteRestaurant(currentRestaurant.id, { onSuccess: advance })
        }
      />
    </>
  );
}

export default RestaurantValidatorTool;
