import { PRODUCT_STATUSES } from "@/utils/constants";

import Heading from "@/ui/Heading";

import DashboardBox from "./DashboardBox";
import StatCount from "./StatCount";

import {
  HiOutlineExclamationCircle,
  HiOutlineQuestionMarkCircle,
  HiOutlineXCircle,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import styled from "styled-components";

const GroupStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2.4rem;
`;

const ICON_COMPONENTS = {
  NOT_FOUND: <HiOutlineExclamationCircle />,
  MAYBE_VEGAN: <HiOutlineQuestionMarkCircle />,
  VEGAN: <HiOutlineCheckCircle />,
  NON_VEGAN: <HiOutlineXCircle />,
};

function ProductStatusesAllTimeStats() {
  return (
    <DashboardBox>
      <Heading as="h2">Statuts des produits</Heading>
      <GroupStats>
        {Object.entries(PRODUCT_STATUSES).map(([key, o]) => (
          <StatCount
            key={key}
            title={o.label}
            color={o.color}
            icon={ICON_COMPONENTS[key]}
            filters={[{ field: "status", value: key }]}
            to={`/products?status=${key}`}
          />
        ))}
      </GroupStats>
    </DashboardBox>
  );
}

export default ProductStatusesAllTimeStats;
