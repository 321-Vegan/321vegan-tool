import { useState } from "react";
import styled from "styled-components";

import { S3_STORAGE_URL } from "@/utils/constants";
import Lightbox from "@/ui/Lightbox";
import RatingStars from "@/features/reviews/RatingStars";

const CRITERIA = [
  { field: "rating_choice", label: "Choix végane" },
  { field: "rating_value", label: "Qualité-prix" },
  { field: "rating_taste", label: "Goût" },
  { field: "rating_service", label: "Accueil" },
];

// Price per person, as in the app (API RestaurantPriceRange)
const PRICE_RANGES = {
  UNDER_10: "Moins de 10 €",
  FROM_10_TO_20: "10 – 20 €",
  FROM_20_TO_30: "20 – 30 €",
  FROM_30_TO_50: "30 – 50 €",
  OVER_50: "Plus de 50 €",
};

const Criteria = styled.dl`
  display: grid;
  grid-template-columns: max-content max-content;
  align-items: center;
  gap: 0.2rem 1.2rem;
  margin-top: 0.8rem;
  font-size: 1.2rem;
  color: var(--color-grey-500);
`;

const Thumbnails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.8rem;

  & button {
    padding: 0;
    border: none;
    background: none;
    cursor: zoom-in;
  }

  & img {
    display: block;
    width: 14rem;
    height: 14rem;
    object-fit: cover;
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--color-grey-200);
  }
`;

// Detailed ratings and price per person (read-only) and photos of a
// restaurant review.
function RestaurantReviewDetails({ review }) {
  const rated = CRITERIA.filter(({ field }) => review[field] !== null);
  const priceRange = review.price_range;
  const [openIndex, setOpenIndex] = useState(null);
  const images = review.photos.map((photo) => ({
    src: `${S3_STORAGE_URL}/${photo.path}`,
    alt: "Photo de l'avis",
  }));

  return (
    <>
      {(rated.length > 0 || priceRange) && (
        <Criteria>
          {rated.map(({ field, label }) => [
            <dt key={`${field}-label`}>{label}</dt>,
            <dd key={`${field}-value`}>
              <RatingStars
                rating={review[field]}
                name={`review-${review.id}-${field}`}
              />
            </dd>,
          ])}
          {priceRange && [
            <dt key="price-label">Prix par personne</dt>,
            <dd key="price-value">{PRICE_RANGES[priceRange] || priceRange}</dd>,
          ]}
        </Criteria>
      )}
      {review.photos.length > 0 && (
        <Thumbnails>
          {review.photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setOpenIndex(index)}
            >
              <img src={images[index].src} alt={images[index].alt} />
            </button>
          ))}
          <Lightbox
            images={images}
            index={openIndex}
            onIndexChange={setOpenIndex}
          />
        </Thumbnails>
      )}
    </>
  );
}

export default RestaurantReviewDetails;
