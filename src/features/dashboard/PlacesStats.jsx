import { usePlacesCount } from "./usePlacesCount";

import Heading from "@/ui/Heading";
import Stat from "./Stat";
import DashboardBox from "./DashboardBox";

import { HiOutlineMapPin } from "react-icons/hi2";

import styled from "styled-components";

const StyledDashboardBox = styled(DashboardBox)`
  grid-column: 3 / span 2;
`;

const GroupStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.4rem;
`;

function PlacesStats() {
  const { isPending: isPendingToValidate, count: toValidateCount } =
    usePlacesCount(false);
  const { isPending: isPendingValidated, count: validatedCount } =
    usePlacesCount(true);

  return (
    <StyledDashboardBox>
      <Heading as="h2">Lieux</Heading>
      <GroupStats>
        <Stat
          title="Lieux à valider"
          color="yellow"
          icon={<HiOutlineMapPin />}
          value={toValidateCount}
          isPending={isPendingToValidate}
          to="/places"
        />
        <Stat
          title="Lieux validés"
          color="green"
          icon={<HiOutlineMapPin />}
          value={validatedCount}
          isPending={isPendingValidated}
        />
      </GroupStats>
    </StyledDashboardBox>
  );
}

export default PlacesStats;
