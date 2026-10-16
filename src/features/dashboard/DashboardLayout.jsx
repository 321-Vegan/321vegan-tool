import { useCurrentUserContext } from "@/contexts/CurrentUserContext";

import ErrorReportsStats from "./ErrorReportsStats";
import ReviewsStats from "./ReviewsStats";
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
      {hasAccess("admin") && (
        <>
          <ReviewsStats resource="shop-reviews" title="Avis sur les magasins" />
          {/* Ratings without comment are auto-approved: not moderation work */}
          <ReviewsStats
            resource="product-reviews"
            title="Avis sur les produits"
            filters={[{ field: "comment__isnull", value: false }]}
          />
          <PlacesStats />
        </>
      )}
      <ProductStatesAllTimeStats />
      <ProductStatusesAllTimeStats />
    </StyledDashboardLayout>
  );
}

export default DashboardLayout;
