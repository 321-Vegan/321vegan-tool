import Button from "@/ui/Button";
import Row from "@/ui/Row";

import styled from "styled-components";

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-bottom: 2.4rem;
`;

const ProgressBarOuter = styled.div`
  width: 100%;
  height: 0.8rem;
  background-color: var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
`;

const ProgressBarInner = styled.div`
  height: 100%;
  width: ${(props) => props.$percent}%;
  background-color: var(--color-brand-600);
  border-radius: var(--border-radius-lg);
  transition: width 0.3s ease;
`;

const ProgressText = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 2.4rem;
`;

// Generic progress bar for one-by-one validation tools (products, shops, ...).
// Also adds a button to skip the current item, and a button to quit the validation mode.
function ValidatorProgress({ current, total, onSkip, onQuit, label = "Élément" }) {
  const percent = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;

  return (
    <ProgressContainer>
      <Row type="horizontal">
        <ProgressText>
          {label} {current + 1} sur {total}
        </ProgressText>
        <ButtonGroup>
          <Button $variation="secondary" $size="small" onClick={onSkip}>
            Passer
          </Button>
          <Button $variation="danger" $size="small" onClick={onQuit}>
            Quitter
          </Button>
        </ButtonGroup>
      </Row>
      <ProgressBarOuter>
        <ProgressBarInner $percent={percent} />
      </ProgressBarOuter>
    </ProgressContainer>
  );
}

export default ValidatorProgress;
