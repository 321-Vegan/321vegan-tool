import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import Button from "@/ui/Button";
import Heading from "@/ui/Heading";
import Spinner from "@/ui/Spinner";
import ValidatorProgress from "@/ui/ValidatorProgress";

import { useShopsToValidate } from "./useShopsToValidate";
import { useValidateShop } from "./useValidateShop";
import { useDeleteShop } from "./useDeleteShop";
import ShopValidatorCard from "./ShopValidatorCard";

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

// Shops are snapshotted once loaded so validating/deleting one (which refetches
// the list) doesn't reorder or skip items mid-session.
function ShopValidatorTool() {
  const { isPending, shops } = useShopsToValidate();
  const { validateShop, isValidating } = useValidateShop();
  const { deleteShop, isDeleting } = useDeleteShop();

  const [snapshot, setSnapshot] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isPending && snapshot === null) setSnapshot(shops);
  }, [isPending, shops, snapshot]);

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
        <Heading as="h2">Aucun lieu à valider</Heading>
        <EmptyText>Tous les lieux soumis ont été traités. 💚</EmptyText>
      </EmptyContainer>
    );
  }

  if (currentIndex >= snapshot.length) {
    return (
      <EmptyContainer>
        <Heading as="h2">Validation terminée</Heading>
        <EmptyText>
          Vous avez traité tous les lieux de cette session. Merci pour votre
          contribution ! 💚
        </EmptyText>
        <Button onClick={handleRestart}>Retour</Button>
      </EmptyContainer>
    );
  }

  const currentShop = snapshot[currentIndex];
  const isProcessing = isValidating || isDeleting;

  return (
    <>
      <ValidatorProgress
        current={currentIndex}
        total={snapshot.length}
        onSkip={advance}
        onQuit={() => setCurrentIndex(snapshot.length)}
        label="Lieu"
      />
      <ShopValidatorCard
        key={currentShop.id}
        shop={currentShop}
        isProcessing={isProcessing}
        onValidate={(fields) =>
          validateShop({ id: currentShop.id, ...fields }, { onSuccess: advance })
        }
        onDelete={() => deleteShop(currentShop.id, { onSuccess: advance })}
      />
    </>
  );
}

export default ShopValidatorTool;
