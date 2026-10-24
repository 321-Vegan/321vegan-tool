import styled from "styled-components";

import NoDataItem from "@/ui/NoDataItem";
import { DAYS } from "./restaurantConstants";

const List = styled.dl`
  display: grid;
  grid-template-columns: 10rem 1fr;
  gap: 0.2rem 1.2rem;
  font-size: 1.4rem;
`;

// Read-only week schedule: a day without slot is closed.
function OpeningHoursList({ slots }) {
  if (!slots?.length) return <NoDataItem>Horaires inconnus</NoDataItem>;

  return (
    <List>
      {DAYS.map((day, index) => {
        const daySlots = slots
          .filter((slot) => slot.day === index)
          .sort((a, b) => a.open.localeCompare(b.open));
        return [
          <dt key={`${day}-label`}>{day}</dt>,
          <dd key={`${day}-slots`}>
            {daySlots.length
              ? daySlots.map((s) => `${s.open} – ${s.close}`).join(", ")
              : "Fermé"}
          </dd>,
        ];
      })}
    </List>
  );
}

export default OpeningHoursList;
