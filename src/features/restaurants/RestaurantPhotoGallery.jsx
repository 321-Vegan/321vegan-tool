import styled from "styled-components";
import {
  HiArrowsRightLeft,
  HiCheck,
  HiOutlineStar,
  HiOutlineTrash,
  HiStar,
  HiXMark,
} from "react-icons/hi2";

import { S3_STORAGE_URL } from "@/utils/constants";

import Button from "@/ui/Button";
import ConfirmAction from "@/ui/ConfirmAction";
import ImageZoom from "@/ui/ImageZoom";
import Modal from "@/ui/Modal";
import NoDataItem from "@/ui/NoDataItem";
import Tag from "@/ui/Tag";
import { PHOTO_KINDS, PHOTO_STATUSES, otherKind } from "./restaurantConstants";

const Gallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
  gap: 1.6rem;
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

const Actions = styled.div`
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
 * options). With onFeature, each photo can be made the featured one; with
 * onModerate and onDelete, approved, rejected or deleted; with onChangeKind,
 * moved from place to menu or the other way round.
 *
 * @param {Number} featuredId: the photo chosen as featured, if any
 * @param {Function} onFeature: optional (photo) => void
 * @param {Function} onModerate: optional (photo, status) => void
 * @param {Function} onDelete: optional (photo) => void
 * @param {Function} onChangeKind: optional (photo, kind) => void
 * */
function RestaurantPhotoGallery({
  photos,
  featuredId,
  onFeature,
  onModerate,
  onDelete,
  onChangeKind,
  disabled,
}) {
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
            height={30}
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
            {photo.status !== "APPROVED" && PHOTO_STATUSES[photo.status] && (
              <Tag type={PHOTO_STATUSES[photo.status].color}>
                {PHOTO_STATUSES[photo.status].label}
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
          {(onModerate || onDelete || onChangeKind) && (
            <Actions>
              {onChangeKind && photo.kind && (
                <Button
                  $variation="secondary"
                  $size="small"
                  disabled={disabled}
                  onClick={() => onChangeKind(photo, otherKind(photo.kind))}
                >
                  <HiArrowsRightLeft /> Passer en{" "}
                  {PHOTO_KINDS[otherKind(photo.kind)].label}
                </Button>
              )}
              {onModerate && photo.status !== "APPROVED" && (
                <Button
                  $size="small"
                  disabled={disabled}
                  onClick={() => onModerate(photo, "APPROVED")}
                >
                  <HiCheck /> Approuver
                </Button>
              )}
              {onModerate && photo.status !== "REJECTED" && (
                <Button
                  $variation="secondary"
                  $size="small"
                  disabled={disabled}
                  onClick={() => onModerate(photo, "REJECTED")}
                >
                  <HiXMark /> Refuser
                </Button>
              )}
              {onDelete && (
                <Modal>
                  <Modal.Open opens="delete-photo">
                    <Button
                      $variation="danger"
                      $size="small"
                      disabled={disabled}
                    >
                      <HiOutlineTrash />
                    </Button>
                  </Modal.Open>
                  <Modal.Window name="delete-photo">
                    <ConfirmAction
                      variation="delete"
                      title="Supprimer cette photo"
                      message="La photo sera définitivement supprimée."
                      btnText="Supprimer"
                      onConfirm={() => onDelete(photo)}
                      disabled={disabled}
                    />
                  </Modal.Window>
                </Modal>
              )}
            </Actions>
          )}
        </Photo>
      ))}
    </Gallery>
  );
}

export default RestaurantPhotoGallery;
