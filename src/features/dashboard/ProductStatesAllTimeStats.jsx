import { PRODUCT_STATES } from "@/utils/constants";
import { useCurrentUserContext } from "@/contexts/CurrentUserContext";

import Heading from "@/ui/Heading";

import DashboardBox from "./DashboardBox";
import StatCount from "./StatCount";

import {
  HiOutlineDocumentCheck,
  HiOutlineEnvelope,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineSparkles,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";

import styled from "styled-components";

const GroupStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.6rem;
`;

const ICON_COMPONENTS = {
  CREATED: <HiOutlineDocumentCheck />,
  NEED_CONTACT: <HiOutlineEnvelope />,
  WAITING_BRAND_REPLY: <HiOutlineClock />,
  TO_INVESTIGATE: <HiOutlineMagnifyingGlass />,
  WAITING_PUBLISH: <HiOutlineSparkles />,
  PUBLISHED: <HiOutlineCheck />,
};

// States with a dedicated one-by-one tool link to it, others to the filtered product list.
const STATE_TOOLS = {
  CREATED: { to: "/verifications", role: "contributor" },
  WAITING_PUBLISH: { to: "/publications", role: "admin" },
};

function ProductStatesAllTimeStats() {
  const { hasAccess } = useCurrentUserContext();

  function getLink(state) {
    const tool = STATE_TOOLS[state];
    if (tool && hasAccess(tool.role)) return tool.to;
    return `/products?state=${state}`;
  }

  return (
    <DashboardBox>
      <Heading as="h2">États des produits</Heading>
      <GroupStats>
        {Object.entries(PRODUCT_STATES).map(([key, o]) => (
          <StatCount
            key={key}
            title={o.label}
            color={o.color}
            icon={ICON_COMPONENTS[key]}
            filters={[{ field: "state", value: key }]}
            to={getLink(key)}
          />
        ))}
      </GroupStats>
    </DashboardBox>
  );
}

export default ProductStatesAllTimeStats;
