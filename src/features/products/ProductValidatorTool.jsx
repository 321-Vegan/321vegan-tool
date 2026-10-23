import { useState, useCallback } from "react";
import styled from "styled-components";

import Button from "@/ui/Button";
import Heading from "@/ui/Heading";
import Spinner from "@/ui/Spinner";

import { useCurrentUserContext } from "@/contexts/CurrentUserContext";
import { useValidatorProducts } from "./useValidatorProducts";
import ValidatorSetup from "./ValidatorSetup";
import ValidatorProgress from "@/ui/ValidatorProgress";
import ProductRegister from "./ProductRegister";

const CompletedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.4rem;
  padding: 4.8rem 2.4rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  text-align: center;
`;

const CompletedText = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
`;

// "validate" goes through scanned products (CREATED),
// "publish" goes through products waiting to be published (WAITING_PUBLISH, admin only).
const MODES = {
  validate: {
    state: "CREATED",
    title: "Vérification des produits scannés",
    actionLabel: "Commencer la vérification",
    countLabel: "à vérifier",
    completedTitle: "Validation terminée",
    showBrandAnswer: false,
  },
  publish: {
    state: "WAITING_PUBLISH",
    title: "Publication des produits",
    actionLabel: "Commencer la publication",
    countLabel: "à publier",
    completedTitle: "Publication terminée",
    showBrandAnswer: true,
  },
};

// 3 phases managed by the "phase" state : setup -> validating -> completed
function ProductValidatorTool({ mode = "validate" }) {
  const {
    state,
    title,
    actionLabel,
    countLabel,
    completedTitle,
    showBrandAnswer,
  } = MODES[mode];
  const { hasAccess } = useCurrentUserContext();
  const defaultState = hasAccess("admin") ? "PUBLISHED" : "WAITING_PUBLISH";
  const [phase, setPhase] = useState("setup");
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [productSnapshot, setProductSnapshot] = useState([]);

  const { isPending, products } = useValidatorProducts(
    selectedStatuses,
    true,
    state,
  );

  // Shuffle to reduce collision risk when multiple contributors validate at the same time
  function handleStart(statuses) {
    const filtered =
      statuses.length > 0
        ? products?.filter((p) => statuses.includes(p.status)) || []
        : products || [];

    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setSelectedStatuses(statuses);
    setProductSnapshot(shuffled);
    setCurrentIndex(0);
    setPhase("validating");
  }

  const handleProductComplete = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= productSnapshot.length) {
        setPhase("completed");
        return prev;
      }
      return next;
    });
  }, [productSnapshot.length]);

  function handleSkip() {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= productSnapshot.length) {
        setPhase("completed");
        return prev;
      }
      return next;
    });
  }

  function handleQuit() {
    setPhase("setup");
    setCurrentIndex(0);
    setProductSnapshot([]);
    setSelectedStatuses([]);
  }

  function handleRestart() {
    setPhase("setup");
    setCurrentIndex(0);
    setProductSnapshot([]);
    setSelectedStatuses([]);
  }

  if (phase === "setup") {
    if (isPending) return <Spinner />;
    return (
      <ValidatorSetup
        onStart={handleStart}
        products={products}
        isPending={isPending}
        title={title}
        actionLabel={actionLabel}
        countLabel={countLabel}
      />
    );
  }

  if (phase === "completed") {
    return (
      <CompletedContainer>
        <Heading as="h2">{completedTitle}</Heading>
        <CompletedText>
          La session est terminée. Merci infiniement pour votre contribution 💚
        </CompletedText>
        <Button onClick={handleRestart}>Retour</Button>
      </CompletedContainer>
    );
  }

  const currentProduct = productSnapshot[currentIndex];

  if (!currentProduct) {
    setPhase("completed");
    return null;
  }

  return (
    <>
      <ValidatorProgress
        current={currentIndex}
        total={productSnapshot.length}
        onSkip={handleSkip}
        onQuit={handleQuit}
        label="Produit"
      />
      <ProductRegister
        key={currentProduct.ean}
        ean={currentProduct.ean}
        onClose={handleProductComplete}
        defaultState={defaultState}
        expectedState={state}
        showBrandAnswer={showBrandAnswer}
      />
    </>
  );
}

export default ProductValidatorTool;
