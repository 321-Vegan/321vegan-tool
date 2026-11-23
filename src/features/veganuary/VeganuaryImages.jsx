import { useState } from "react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import {
  useUploadVeganuaryImage,
  useVeganuaryImages,
} from "./useVeganuaryImages";
import { imageUrl } from "./weekFile";

import FileInput from "@/ui/FileInput";
import Heading from "@/ui/Heading";
import Input from "@/ui/Input";
import Spinner from "@/ui/Spinner";

import { HiOutlineClipboardDocument, HiOutlineCheck } from "react-icons/hi2";
import styled from "styled-components";

const StyledImages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;

  & > p {
    color: var(--color-grey-500);
  }
`;

const Tools = styled.div`
  display: flex;
  gap: 1.6rem;
  align-items: center;
  flex-wrap: wrap;
`;

const Grid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 1.6rem;
`;

const Card = styled.li`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.8rem;
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-0);

  & img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: contain;
    background-color: var(--color-grey-50);
    border-radius: var(--border-radius-sm);
  }
`;

const Path = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  font-size: 1.1rem;
  color: var(--color-grey-600);
  text-align: left;
  word-break: break-all;

  & svg {
    flex-shrink: 0;
    width: 1.6rem;
    height: 1.6rem;
  }

  &:hover {
    color: var(--color-brand-600);
  }
`;

// The course's images in the bucket: upload one, then copy its path into a
// week ("image", "src", "cover_image"...).
function VeganuaryImages() {
  const { isPending, images } = useVeganuaryImages();
  const { isUploading, uploadImage } = useUploadVeganuaryImage();
  const { text: copied, copyToClipboard } = useCopyToClipboard();
  const [search, setSearch] = useState("");

  async function handleFiles(e) {
    const files = [...e.target.files];
    e.target.value = "";
    try {
      for (const file of files) {
        const { path } = await uploadImage(file);
        copyToClipboard(path);
      }
    } catch {
      // Already told by the upload's toast
    }
  }

  const shown = (images ?? []).filter((image) =>
    image.path.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <StyledImages>
      <Heading as="h2">Images</Heading>
      <p>
        Envoyées en WebP dans le dossier veganuary/ du stockage. Cliquez sur
        un chemin pour le copier, puis collez-le dans la semaine. Pour
        remplacer une image, envoyez la nouvelle et changez son chemin : les
        apps gardent les images pour toujours.
      </p>

      <Tools>
        <FileInput
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isUploading}
          onChange={handleFiles}
        />
        <Input
          type="search"
          placeholder="Rechercher une image"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Tools>

      {isPending ? (
        <Spinner />
      ) : (
        <Grid>
          {shown.map((image) => (
            <Card key={image.path}>
              <img src={imageUrl(image.path)} alt="" loading="lazy" />
              <Path
                type="button"
                title="Copier le chemin"
                onClick={() => copyToClipboard(image.path)}
              >
                {copied === image.path ? (
                  <HiOutlineCheck />
                ) : (
                  <HiOutlineClipboardDocument />
                )}
                {image.path}
              </Path>
            </Card>
          ))}
        </Grid>
      )}
    </StyledImages>
  );
}

export default VeganuaryImages;
