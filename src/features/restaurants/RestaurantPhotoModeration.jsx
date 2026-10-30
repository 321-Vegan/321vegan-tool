import { useState } from "react";
import { HiArrowsRightLeft, HiCheck, HiTrash, HiXMark } from "react-icons/hi2";
import styled from "styled-components";

import { S3_STORAGE_URL } from "@/utils/constants";
import { formatDate, formatDistanceFromNow } from "@/utils/helpers";

import ButtonAction from "@/ui/ButtonAction";
import ConfirmAction from "@/ui/ConfirmAction";
import Empty from "@/ui/Empty";
import ImageZoom from "@/ui/ImageZoom";
import Lightbox from "@/ui/Lightbox";
import Modal from "@/ui/Modal";
import Pagination from "@/ui/Pagination";
import Spinner from "@/ui/Spinner";
import Tag from "@/ui/Tag";
import Tooltip from "@/ui/Tooltip";

import { PHOTO_KINDS, VEGAN_STATUSES, otherKind } from "./restaurantConstants";
import { usePendingRestaurantPhotos } from "./usePendingRestaurantPhotos";
import { useModerateRestaurantPhoto } from "./useModerateRestaurantPhoto";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(38rem, 1fr));
  gap: 2.4rem;
  margin-bottom: 2.4rem;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.6rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
`;

const Title = styled.div`
  font-weight: 600;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.3rem;
  color: var(--color-grey-500);
`;

const Actions = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-top: auto;
`;

// Place and menu photos added to validated restaurants, oldest first.
function RestaurantPhotoModeration() {
  const { isPending, photos, count } = usePendingRestaurantPhotos();
  const { isWorking, updatePhotoStatus, updatePhotoKind, deletePhoto } =
    useModerateRestaurantPhoto();
  const [openIndex, setOpenIndex] = useState(null);

  if (isPending) return <Spinner />;
  if (!photos.length) return <Empty message="Aucune photo à valider 💚" />;

  const images = photos.map((photo) => ({
    src: `${S3_STORAGE_URL}/${photo.path}`,
    alt: photo.restaurant.name,
  }));

  return (
    <>
      <Lightbox
        images={images}
        index={openIndex}
        onIndexChange={setOpenIndex}
      />
      <Grid>
        {photos.map((photo, index) => (
          <Card key={photo.id}>
            <ImageZoom
              src={images[index].src}
              alt={images[index].alt}
              height={38}
              onClick={() => setOpenIndex(index)}
            />
            <Title>
              {photo.restaurant.name}
              {photo.restaurant.city && ` · ${photo.restaurant.city}`}
            </Title>
            <Meta>
              <Tag type={PHOTO_KINDS[photo.kind].color}>
                {PHOTO_KINDS[photo.kind].label}
              </Tag>
              <Tag type={VEGAN_STATUSES[photo.restaurant.vegan_status].color}>
                {VEGAN_STATUSES[photo.restaurant.vegan_status].label}
              </Tag>
              <span>
                {formatDate(photo.created_at)} (
                {formatDistanceFromNow(photo.created_at)})
              </span>
            </Meta>
            <Modal>
              <Actions>
                <Tooltip content="Valider" id={`approve-photo-${photo.id}`}>
                  <ButtonAction
                    $variation="confirm"
                    disabled={isWorking}
                    onClick={() =>
                      updatePhotoStatus({
                        photoId: photo.id,
                        status: "APPROVED",
                      })
                    }
                  >
                    <HiCheck />
                  </ButtonAction>
                </Tooltip>
                <Tooltip content="Rejeter" id={`reject-photo-${photo.id}`}>
                  <ButtonAction
                    $variation="accent"
                    disabled={isWorking}
                    onClick={() =>
                      updatePhotoStatus({
                        photoId: photo.id,
                        status: "REJECTED",
                      })
                    }
                  >
                    <HiXMark />
                  </ButtonAction>
                </Tooltip>
                <Tooltip
                  content={`Passer en ${PHOTO_KINDS[otherKind(photo.kind)].label}`}
                  id={`kind-photo-${photo.id}`}
                >
                  <ButtonAction
                    $variation="info"
                    disabled={isWorking}
                    onClick={() =>
                      updatePhotoKind({
                        photoId: photo.id,
                        kind: otherKind(photo.kind),
                      })
                    }
                  >
                    <HiArrowsRightLeft />
                  </ButtonAction>
                </Tooltip>
                <Tooltip content="Supprimer" id={`delete-photo-${photo.id}`}>
                  <Modal.Open opens="delete">
                    <ButtonAction $variation="danger" disabled={isWorking}>
                      <HiTrash />
                    </ButtonAction>
                  </Modal.Open>
                </Tooltip>
              </Actions>
              <Modal.Window name="delete">
                <ConfirmAction
                  variation="delete"
                  title="Supprimer une photo"
                  message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer définitivement cette photo ?"
                  onConfirm={() =>
                    deletePhoto({
                      restaurantId: photo.restaurant_id,
                      photoId: photo.id,
                    })
                  }
                  disabled={isWorking}
                />
              </Modal.Window>
            </Modal>
          </Card>
        ))}
      </Grid>
      <Pagination count={count} />
    </>
  );
}

export default RestaurantPhotoModeration;
