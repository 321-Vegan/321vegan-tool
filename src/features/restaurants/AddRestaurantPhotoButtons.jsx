import { useRef } from "react";
import { HiOutlinePhoto } from "react-icons/hi2";
import toast from "react-hot-toast";
import styled from "styled-components";

import Button from "@/ui/Button";
import SpinnerMini from "@/ui/SpinnerMini";
import { useUploadRestaurantPhotos } from "./useUploadRestaurantPhotos";
import { MAX_PHOTOS_PER_KIND, PHOTO_KINDS } from "./restaurantConstants";

const Buttons = styled.div`
  display: flex;
  gap: 1.2rem;
`;

/**
 * A button per photo kind (place, menu) to upload some, approved right away
 * as sent by a moderator. Greyed out once the kind has the most photos.
 *
 * @param {Array} photos: the restaurant's current photos
 * @param {Function} onAdded: optional (photos) => void, once uploaded
 * */
function AddRestaurantPhotoButtons({
  restaurantId,
  photos,
  onAdded,
  disabled,
}) {
  // One hidden file input, opened by the button of the kind to add
  const fileInput = useRef(null);
  const uploadKind = useRef(null);
  const { uploadPhotos, isUploading } = useUploadRestaurantPhotos();

  const slotsLeft = (kind) =>
    MAX_PHOTOS_PER_KIND - photos.filter((p) => p.kind === kind).length;

  function handleAdd(kind) {
    uploadKind.current = kind;
    fileInput.current.click();
  }

  function handleFileChange(e) {
    const kind = uploadKind.current;
    const picked = [...e.target.files];
    // Lets the same files be picked again
    e.target.value = "";
    if (!picked.length) return;
    const files = picked.slice(0, slotsLeft(kind));
    if (files.length < picked.length)
      toast.error(
        `${MAX_PHOTOS_PER_KIND} photos au plus par type : seules les ${files.length} premières sont envoyées.`,
      );
    uploadPhotos(
      { restaurantId, kind, files },
      { onSuccess: (data) => onAdded?.(data.photos) },
    );
  }

  return (
    <Buttons>
      {Object.entries(PHOTO_KINDS).map(([kind, { label }]) => (
        <Button
          key={kind}
          $variation="secondary"
          $size="small"
          onClick={() => handleAdd(kind)}
          disabled={disabled || isUploading || slotsLeft(kind) <= 0}
        >
          {isUploading && uploadKind.current === kind ? (
            <SpinnerMini size="xs" />
          ) : (
            <HiOutlinePhoto />
          )}
          Ajouter des photos ({label.toLowerCase()})
        </Button>
      ))}
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        hidden
      />
    </Buttons>
  );
}

export default AddRestaurantPhotoButtons;
