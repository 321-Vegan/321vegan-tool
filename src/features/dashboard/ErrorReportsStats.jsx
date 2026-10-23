import { useCurrentUserContext } from "@/contexts/CurrentUserContext";
import { useErrorReportsCount } from "./useErrorReportsCount";

import Heading from "@/ui/Heading";
import Stat from "./Stat";
import DashboardBox from "./DashboardBox";

import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import styled from "styled-components";

const StyledDashboardBox = styled(DashboardBox)`
  grid-column: 1 / span 2;
`;

const GroupStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.4rem;
`;

function ErrorReportsStats() {
  const { hasAccess } = useCurrentUserContext();
  const canOpen = hasAccess("contributor");
  const { isPending: isPendingUntreated, count: untreatedCount } =
    useErrorReportsCount(false);
  const { isPending: isPendingTreated, count: treatedCount } =
    useErrorReportsCount(true);

  return (
    <StyledDashboardBox>
      <Heading as="h2">Erreurs signalées</Heading>
      <GroupStats>
        <Stat
          title="Erreurs non traitées"
          color="yellow"
          icon={<HiOutlineExclamationTriangle />}
          value={untreatedCount}
          isPending={isPendingUntreated}
          to={canOpen && "/error-reports?handled=false"}
        />
        <Stat
          title="Erreurs traitées"
          color="green"
          icon={<HiOutlineExclamationTriangle />}
          value={treatedCount}
          isPending={isPendingTreated}
          to={canOpen && "/error-reports?handled=true"}
        />
      </GroupStats>
    </StyledDashboardBox>
  );
}

export default ErrorReportsStats;
