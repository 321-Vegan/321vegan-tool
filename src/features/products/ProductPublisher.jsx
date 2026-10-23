import Row from "@/ui/Row";
import Heading from "@/ui/Heading";
import ProductValidatorTool from "@/features/products/ProductValidatorTool";

import { HiOutlineSparkles } from "react-icons/hi2";

function ProductPublisher() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">
          <HiOutlineSparkles /> Publication des produits
        </Heading>
      </Row>

      <ProductValidatorTool mode="publish" />
    </>
  );
}

export default ProductPublisher;
