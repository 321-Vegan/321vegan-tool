import Ratings from "@/ui/Ratings";

import styled from "styled-components";

const StyledRatingStars = styled.div`
  display: flex;
  justify-content: start;
  font-size: 1.4rem;
`;

/**
 * Read-only stars for a rating out of 5.
 *
 * @param {Number} rating: the rating to display
 * @param {String} name: unique name for the underlying radio group
 * */
function RatingStars({ rating, name }) {
  return (
    <StyledRatingStars title={`${rating}/5`}>
      <Ratings defaultValue={rating} name={name}>
        {[...Array(6).keys()].slice(1).map((i) => (
          <Ratings.Rating
            key={`${name}-${i}`}
            value={i}
            disabled={true}
            color={"brand"}
          />
        ))}
      </Ratings>
    </StyledRatingStars>
  );
}

export default RatingStars;
