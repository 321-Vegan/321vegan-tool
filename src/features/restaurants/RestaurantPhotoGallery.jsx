import styled from "styled-components";

import { S3_STORAGE_URL } from "@/utils/constants";

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

// Menu photos first: they are the proof of the vegan options.
function RestaurantPhotoGallery({ photos }) {
  if (!photos.length) return <NoDataItem>Aucune photo</NoDataItem>;

  const sorted = [...photos].sort((a, b) =>
    a.kind === b.kind ? 0 : a.kind === "MENU" ? -1 : 1,
  );

  return (
    <Gallery>
      {sorted.map((photo) => (
        <Photo key={photo.id}>
          <ImageZoom
            src={`${S3_STORAGE_URL}/${photo.path}`}
            alt={PHOTO_KINDS[photo.kind]?.label}
            height={18}
          />
          {photo.kind && (
            <Tag type={PHOTO_KINDS[photo.kind].color}>
              {PHOTO_KINDS[photo.kind].label}
            </Tag>
          )}
        </Photo>
      ))}
    </Gallery>
  );
}

export default RestaurantPhotoGallery;
