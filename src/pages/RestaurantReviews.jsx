import Row from "@/ui/Row";
import Heading from "@/ui/Heading";

import ReviewTable from "@/features/reviews/ReviewTable";
import RestaurantReviewDetails from "@/features/restaurants/RestaurantReviewDetails";

import { MdOutlineRestaurant } from "react-icons/md";

const restaurantSubject = {
  label: "Restaurant",
  filterField: "restaurant",
  toFilter: (value) => ({ field: "restaurant___name__contains", value }),
  render: (review) =>
    [review.restaurant.name, review.restaurant.city].filter(Boolean).join(" · "),
};

function RestaurantReviews() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">
          <MdOutlineRestaurant /> Avis restaurants
        </Heading>
      </Row>

      {/* Ratings alone are approved by the API: only reviews with a comment or photos need moderation */}
      <ReviewTable
        resource="restaurant-reviews"
        subject={restaurantSubject}
        defaultStatus="PENDING"
        renderDetails={(review) => <RestaurantReviewDetails review={review} />}
      />
    </>
  );
}

export default RestaurantReviews;
