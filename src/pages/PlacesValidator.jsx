import { useSearchParams } from "react-router-dom";
import styled from "styled-components";

import Row from "@/ui/Row";
import Heading from "@/ui/Heading";
import Button from "@/ui/Button";
import ShopValidatorTool from "@/features/shops/ShopValidatorTool";
import RestaurantValidatorTool from "@/features/restaurants/RestaurantValidatorTool";
import RestaurantPhotoModeration from "@/features/restaurants/RestaurantPhotoModeration";

import { HiOutlineMapPin } from "react-icons/hi2";

const TABS = {
  shops: { label: "Magasins", component: ShopValidatorTool },
  restaurants: { label: "Restaurants", component: RestaurantValidatorTool },
  "restaurant-photos": {
    label: "Photos restos",
    component: RestaurantPhotoModeration,
  },
};

const Tabs = styled.div`
  display: flex;
  gap: 1.2rem;
`;

function PlacesValidator() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = TABS[searchParams.get("tab")]
    ? searchParams.get("tab")
    : "shops";
  const TabContent = TABS[currentTab].component;

  function handleTab(tab) {
    // Pagination belongs to the tab being left
    setSearchParams({ tab });
  }

  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">
          <HiOutlineMapPin /> Validation des lieux
        </Heading>
        <Tabs>
          {Object.entries(TABS).map(([tab, { label }]) => (
            <Button
              key={tab}
              $size="small"
              $variation={tab === currentTab ? "primary" : "secondary"}
              onClick={() => handleTab(tab)}
            >
              {label}
            </Button>
          ))}
        </Tabs>
      </Row>

      <TabContent />
    </>
  );
}

export default PlacesValidator;
