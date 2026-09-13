import { useCurrentUserContext } from "@/contexts/CurrentUserContext";

import ErrorReportsStats from "./ErrorReportsStats";
import ShopReviewsStats from "./ShopReviewsStats";
import PlacesStats from "./PlacesStats";
import ProductStatesAllTimeStats from "./ProductStatesAllTimeStats";
import ProductStatusesAllTimeStats from "./ProductStatusesAllTimeStats";

import styled from "styled-components";

const StyledDashboardLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2.4rem;
`;

function DashboardLayout() {
  const { hasAccess } = useCurrentUserContext();

  return (
    <StyledDashboardLayout>
      <ErrorReportsStats />
      {hasAccess("admin") && <ShopReviewsStats />}
      {hasAccess("admin") && <PlacesStats />}
      <ProductStatesAllTimeStats />
      <ProductStatusesAllTimeStats />
    </StyledDashboardLayout>
  );
}

export default DashboardLayout;
