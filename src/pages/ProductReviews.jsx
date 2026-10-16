import { useNavigate } from "react-router-dom";

import Row from "@/ui/Row";
import Heading from "@/ui/Heading";
import ButtonText from "@/ui/ButtonText";

import ReviewTable from "@/features/reviews/ReviewTable";

import { MdOutlineRateReview } from "react-icons/md";

function ProductCell({ product }) {
  const navigate = useNavigate();
  return (
    <>
      <ButtonText onClick={() => navigate(`/products/${product.id}`)}>
        {product.name || product.ean}
      </ButtonText>
      <span>
        {[product.brand_name, product.ean].filter(Boolean).join(" · ")}
      </span>
    </>
  );
}

const productSubject = {
  label: "Produit",
  filterField: "product",
  // Unnamed products are displayed by EAN: search it when only digits are typed
  toFilter: (value) =>
    /^\d+$/.test(value)
      ? { field: "product___ean", value }
      : { field: "product___name__contains", value },
  render: (review) => <ProductCell product={review.product} />,
};

function ProductReviews() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">
          <MdOutlineRateReview /> Avis produits
        </Heading>
      </Row>

      {/* Ratings without comment are approved by the API: only pending ones need moderation */}
      <ReviewTable
        resource="product-reviews"
        subject={productSubject}
        defaultStatus="PENDING"
      />
    </>
  );
}

export default ProductReviews;
