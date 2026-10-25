import { usePlacesCount } from "./usePlacesCount";
import { useRestaurantsToModerateCount } from "./useRestaurantsToModerateCount";

import Heading from "@/ui/Heading";
import Stat from "./Stat";
import DashboardBox from "./DashboardBox";

import {
  HiOutlineMapPin,
  HiOutlinePencilSquare,
  HiOutlinePhoto,
} from "react-icons/hi2";
import { MdOutlineRestaurant } from "react-icons/md";

import styled from "styled-components";

const GroupStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2.4rem;
`;

function PlacesStats() {
  const { isPending: isPendingToValidate, count: toValidateCount } =
    usePlacesCount(false);
  const {
    isPendingRestaurants,
    restaurantsCount,
    isPendingPhotos,
    photosCount,
    isPendingSuggestions,
    suggestionsCount,
  } = useRestaurantsToModerateCount();

  return (
    <DashboardBox>
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
        <Stat
          title="Propositions restos"
          color="yellow"
          icon={<HiOutlinePencilSquare />}
          value={suggestionsCount}
          isPending={isPendingSuggestions}
          to="/restaurant-suggestions"
        />
      </GroupStats>
    </DashboardBox>
  );
}

export default PlacesStats;
