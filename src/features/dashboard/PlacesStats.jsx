import { usePlacesCount } from "./usePlacesCount";
import { useRestaurantsToModerateCount } from "./useRestaurantsToModerateCount";

import Heading from "@/ui/Heading";
import Stat from "./Stat";
import DashboardBox from "./DashboardBox";

import { HiOutlineMapPin, HiOutlinePhoto } from "react-icons/hi2";
import { MdOutlineRestaurant } from "react-icons/md";

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
  const { isPendingRestaurants, restaurantsCount, isPendingPhotos, photosCount } =
    useRestaurantsToModerateCount();

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
        <Stat
          title="Restaurants à valider"
          color="yellow"
          icon={<MdOutlineRestaurant />}
          value={restaurantsCount}
          isPending={isPendingRestaurants}
          to="/places?tab=restaurants"
        />
        <Stat
          title="Photos restos à valider"
          color="yellow"
          icon={<HiOutlinePhoto />}
          value={photosCount}
          isPending={isPendingPhotos}
          to="/places?tab=restaurant-photos"
        />
      </GroupStats>
    </StyledDashboardBox>
  );
}

export default PlacesStats;
