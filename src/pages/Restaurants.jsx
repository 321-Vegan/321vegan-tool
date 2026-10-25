import Row from "@/ui/Row";
import Heading from "@/ui/Heading";
import RestaurantTable from "@/features/restaurants/RestaurantTable";

import { MdOutlineRestaurant } from "react-icons/md";

function Restaurants() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">
          <MdOutlineRestaurant /> Lieux
        </Heading>
      </Row>

      <RestaurantTable />
    </>
  );
}

export default Restaurants;
