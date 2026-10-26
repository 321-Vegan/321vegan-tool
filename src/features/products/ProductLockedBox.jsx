import { formatDate } from "@/utils/helpers";

import Admonition from "@/ui/Admonition";
import Button from "@/ui/Button";
import Heading from "@/ui/Heading";
import Row from "@/ui/Row";

import styled from "styled-components";

const LockedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2.4rem;
`;

// Shown in validator mode instead of the product when another contributor is already verifying it.
function ProductLockedBox({ ean, lock, onSkip }) {
  const { locked_by, locked_at } = lock;

  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">Vérification du produit #{ean}</Heading>
      </Row>

      <LockedContainer>
        <Admonition variation="warning" icon="warning">
          <h4>Déjà en cours par {locked_by}</h4>
          {locked_by} vérifie ce produit depuis{" "}
          {formatDate(locked_at, "HH'h'mm")}. Il s'affichera ici dès qu'il sera
          libéré.
        </Admonition>
        <Button onClick={onSkip}>Passer au suivant</Button>
      </LockedContainer>
    </>
  );
}

export default ProductLockedBox;
