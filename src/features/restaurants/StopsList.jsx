import styled from "styled-components";

import { stopDaysText, stopTitle } from "./openingHours";

const List = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-left: 2rem;
  font-size: 1.4rem;
`;

const Where = styled.div`
  color: var(--color-grey-500);
`;

// Read-only stops of a food truck, the first one being its position.
function StopsList({ stops }) {
  return (
    <List>
      {stops.map((stop, index) => {
        const where = [stop.address, stop.city]
          .filter((part) => part && part !== stopTitle(stop))
          .join(", ");
        return (
          <li key={index}>
            <strong>{stopTitle(stop)}</strong>
            {index === 0 && " (principal)"}
            {where && <Where>{where}</Where>}
            <div>{stopDaysText(stop.opening_hours)}</div>
            {stop.note && <Where>{stop.note}</Where>}
          </li>
        );
      })}
    </List>
  );
}

export default StopsList;
