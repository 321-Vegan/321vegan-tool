import { Link } from "react-router-dom";

import LoaderDots from "@/ui/LoaderDots";

import styled, { css } from "styled-components";

const StyledStat = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);

  padding: 1.6rem;
  display: grid;
  grid-template-columns: 6.4rem 1fr;
  grid-template-rows: auto auto;
  column-gap: 1.6rem;
  row-gap: 0.4rem;

  ${(props) =>
    props.to &&
    css`
      transition: all 0.2s;

      &:hover {
        border-color: var(--color-grey-300);
        box-shadow: var(--shadow-sm);
      }
    `}
`;

const Icon = styled.div`
  grid-row: 1 / -1;
  aspect-ratio: 1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: var(--color-${(props) => props.color}-100);

  & svg {
    width: 3.2rem;
    height: 3.2rem;
    color: var(--color-${(props) => props.color}-700);
  }
`;

const Title = styled.h5`
  align-self: end;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 600;
  color: var(--color-grey-500);
`;

const Value = styled.p`
  font-size: 2.4rem;
  line-height: 1;
  font-weight: 500;
`;

// When "to" is given, the whole card links to the corresponding page.
function Stat({ icon, title, value, color, isPending, to }) {
  return (
    <StyledStat {...(to && { as: Link, to })}>
      <Icon color={color}>{icon}</Icon>
      <Title>{title}</Title>
      {isPending ? <LoaderDots /> : <Value>{value}</Value>}
    </StyledStat>
  );
}

export default Stat;
