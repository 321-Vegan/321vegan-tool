import { useReviewsCount } from "./useReviewsCount";

import Heading from "@/ui/Heading";
import Stat from "./Stat";
import DashboardBox from "./DashboardBox";

import { MdOutlineReviews } from "react-icons/md";

import styled from "styled-components";

const StyledDashboardBox = styled(DashboardBox)`
  grid-column: span 2;
`;

const GroupStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.4rem;
`;

/**
 * @param {Array} filters: optional extra filters applied to both counts
 * */
function ReviewsStats({ resource, title, filters = [] }) {
  const { isPending: isPendingUntreated, count: untreatedCount } =
    useReviewsCount(resource, [
      { field: "status", value: "PENDING" },
      ...filters,
    ]);
  const { isPending: isPendingTreated, count: treatedCount } = useReviewsCount(
    resource,
    [{ field: "status__ne", value: "PENDING" }, ...filters],
  );

  return (
    <StyledDashboardBox>
      <Heading as="h2">{title}</Heading>
      <GroupStats>
        <Stat
          title="Avis non traités"
          color="yellow"
          icon={<MdOutlineReviews />}
          value={untreatedCount}
          isPending={isPendingUntreated}
          to={`/${resource}?status=PENDING`}
        />
        <Stat
          title="Avis traités"
          color="green"
          icon={<MdOutlineReviews />}
          value={treatedCount}
          isPending={isPendingTreated}
          // The list filter can't exclude PENDING: show every status instead
          to={`/${resource}?status=all`}
        />
      </GroupStats>
    </StyledDashboardBox>
  );
}

export default ReviewsStats;
