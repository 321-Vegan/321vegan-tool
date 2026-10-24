import styled from "styled-components";
import { HiOutlineStar, HiStar } from "react-icons/hi2";

import { S3_STORAGE_URL } from "@/utils/constants";

import Button from "@/ui/Button";
import ImageZoom from "@/ui/ImageZoom";
import NoDataItem from "@/ui/NoDataItem";
import Tag from "@/ui/Tag";
import { PHOTO_KINDS } from "./restaurantConstants";

const Gallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 1.2rem;
`;

const Photo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

// Same default as the API: the oldest place photo when none is featured.
function effectiveFeaturedId(photos, featuredId) {
  if (featuredId) return featuredId;
  const places = photos
    .filter((p) => p.kind === "PLACE")
    .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id);
  return places[0]?.id;
}

/**
 * Place and menu photos, menu first (they are the proof of the vegan
 * options). With onFeature, each photo can be made the featured one.
 *
 * @param {Number} featuredId: the photo chosen as featured, if any
 * @param {Function} onFeature: optional (photo) => void
 * */
function RestaurantPhotoGallery({ photos, featuredId, onFeature, disabled }) {
  if (!photos.length) return <NoDataItem>Aucune photo</NoDataItem>;

  const sorted = [...photos].sort((a, b) =>
    a.kind === b.kind ? 0 : a.kind === "MENU" ? -1 : 1,
  );
  const shownFeaturedId = effectiveFeaturedId(photos, featuredId);

  return (
    <Gallery>
      {sorted.map((photo) => (
        <Photo key={photo.id}>
          <ImageZoom
            src={`${S3_STORAGE_URL}/${photo.path}`}
            alt={PHOTO_KINDS[photo.kind]?.label}
            height={18}
          />
          <Tags>
            {photo.kind && (
              <Tag type={PHOTO_KINDS[photo.kind].color}>
                {PHOTO_KINDS[photo.kind].label}
              </Tag>
            )}
            {photo.id === shownFeaturedId && (
              <Tag type="yellow">
                {featuredId ? "Principale" : "Principale par défaut"}
              </Tag>
            )}
          </Tags>
          {onFeature && photo.id !== featuredId && (
            <Button
              $variation="secondary"
              $size="small"
              disabled={disabled}
              onClick={() => onFeature(photo)}
            >
              <HiOutlineStar /> Photo principale
            </Button>
          )}
          {onFeature && photo.id === featuredId && (
            <Button $size="small" disabled>
              <HiStar /> Photo principale
            </Button>
          )}
        </Photo>
      ))}
    </Gallery>
  );
}

export default RestaurantPhotoGallery;
