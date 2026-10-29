import { useRef } from "react";
import { HiOutlinePhoto } from "react-icons/hi2";
import styled from "styled-components";

import Button from "@/ui/Button";
import SpinnerMini from "@/ui/SpinnerMini";
import { useUploadRestaurantPhoto } from "./useUploadRestaurantPhoto";
import { MAX_PHOTOS_PER_KIND, PHOTO_KINDS } from "./restaurantConstants";

const Buttons = styled.div`
  display: flex;
  gap: 1.2rem;
`;

/**
 * A button per photo kind (place, menu) to upload one, approved right away
 * as sent by a moderator. Greyed out once the kind has the most photos.
 *
 * @param {Array} photos: the restaurant's current photos
 * @param {Function} onAdded: optional (photo) => void, once uploaded
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
  const { uploadPhoto, isUploading } = useUploadRestaurantPhoto();

  function handleAdd(kind) {
    uploadKind.current = kind;
    fileInput.current.click();
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    // Lets the same file be picked again
    e.target.value = "";
    if (!file) return;
    uploadPhoto(
      { restaurantId, kind: uploadKind.current, file },
      { onSuccess: onAdded },
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
          disabled={
            disabled ||
            isUploading ||
            photos.filter((p) => p.kind === kind).length >= MAX_PHOTOS_PER_KIND
          }
        >
          {isUploading && uploadKind.current === kind ? (
            <SpinnerMini size="xs" />
          ) : (
            <HiOutlinePhoto />
          )}
          Ajouter une photo ({label.toLowerCase()})
        </Button>
      ))}
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        hidden
      />
    </Buttons>
  );
}

export default AddRestaurantPhotoButtons;
