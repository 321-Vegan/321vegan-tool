import Row from "@/ui/Row";
import Heading from "@/ui/Heading";

import ReviewTable from "@/features/reviews/ReviewTable";

import { MdOutlineReviews } from "react-icons/md";

const shopSubject = {
  label: "Shop",
  filterField: "shop",
  toFilter: (value) => ({ field: "shop___name__contains", value }),
  render: (review) => review.shop.name,
};

function ShopReviews() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">
          <MdOutlineReviews /> Avis magasins
        </Heading>
      </Row>

      <ReviewTable resource="shop-reviews" subject={shopSubject} />
    </>
  );
}

export default ShopReviews;
