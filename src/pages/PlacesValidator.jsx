import Row from "@/ui/Row";
import Heading from "@/ui/Heading";
import ShopValidatorTool from "@/features/shops/ShopValidatorTool";

import { HiOutlineMapPin } from "react-icons/hi2";

function PlacesValidator() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">
          <HiOutlineMapPin /> Validation des lieux
        </Heading>
      </Row>

      <ShopValidatorTool />
    </>
  );
}

export default PlacesValidator;
