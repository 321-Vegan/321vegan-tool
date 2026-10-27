import { useEffect } from "react";
import { isToday } from "date-fns";

import {
  PRODUCT_STATUSES,
  PRODUCT_TYPES,
  S3_STORAGE_URL,
} from "@/utils/constants";
import { formatDate } from "@/utils/helpers";
import { useProductByEan } from "./useProductByEan";
import { useProductLock } from "./useProductLock";
import { useUpdateProduct } from "./useUpdateProduct";

import Row from "@/ui/Row";
import Heading from "@/ui/Heading";
import HeaderDetail from "@/ui/HeaderDetail";
import Section from "@/ui/Section";
import DataBox from "@/ui/DataBox";
import DataItem from "@/ui/DataItem";
import NoDataItem from "@/ui/NoDataItem";
import Tag from "@/ui/Tag";
import Button from "@/ui/Button";
import ButtonGroup from "@/ui/ButtonGroup";
import ImageZoom from "@/ui/ImageZoom";
import Spinner from "@/ui/Spinner";
import SpinnerMini from "@/ui/SpinnerMini";

import ProductLockedBox from "./ProductLockedBox";

import { PiPlant } from "react-icons/pi";
import {
  HiCheck,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineForward,
} from "react-icons/hi2";
import styled from "styled-components";

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 2.4rem;
`;

const FullWidth = styled.div`
  grid-column: 1 / -1;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const Pictures = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4.8rem;
`;

// Publication mode: the product has already been verified,
// so we only show what was registered and publish it in one click.
function ProductPublisherCard({ ean, onClose, onSkip }) {
  const { isPending, product, refetch } = useProductByEan(ean);
  const { isUpdating: isPublishing, updateProduct } = useUpdateProduct();

  // Someone may have published (or changed) the product since the session started
  const isAlreadyHandled =
    !isPending && product && product.state !== "WAITING_PUBLISH";
  useEffect(() => {
    if (isAlreadyHandled) onClose();
  }, [isAlreadyHandled, onClose]);

  const { isPending: isPendingLock, holder: lockHolder } = useProductLock(
    product?.id,
    { enabled: Boolean(product && !isAlreadyHandled), onFreed: refetch },
  );

  if (isPending || isPendingLock || isAlreadyHandled) return <Spinner />;

  if (lockHolder)
    return <ProductLockedBox ean={ean} lock={lockHolder} onSkip={onSkip} />;

  const {
    id,
    created_at,
    name,
    brand,
    status,
    product_type,
    description,
    problem_description,
    has_non_vegan_old_receipe,
    biodynamic,
    image,
    brand_answer,
  } = product;

  function publish() {
    updateProduct(
      { newData: { ...product, state: "PUBLISHED" }, id },
      { onSuccess: () => onClose() },
    );
  }

  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">{name || `Produit #${ean}`}</Heading>
      </Row>

      <DataBox>
        <HeaderDetail type={PRODUCT_STATUSES[status].color}>
          <div>
            <PiPlant />
            <p>
              Ean <span>{ean}</span>
            </p>
          </div>

          <p>
            Ajouté le :
            {isToday(new Date(created_at))
              ? " Aujourd'hui"
              : formatDate(created_at, " dd/MM/yyyy")}
          </p>
        </HeaderDetail>

        <Section>
          <InfoGrid>
            <DataItem label="Statut :" type="horizontal">
              <Tag type={PRODUCT_STATUSES[status].color}>
                {PRODUCT_STATUSES[status].label}
              </Tag>
            </DataItem>

            <DataItem label="Marque :" type="horizontal">
              {brand?.name || <NoDataItem>--</NoDataItem>}
            </DataItem>

            <DataItem label="Type :" type="horizontal">
              <Tag type={PRODUCT_TYPES[product_type].color}>
                {PRODUCT_TYPES[product_type].label}
              </Tag>
            </DataItem>

            <DataItem label="Particularités :" type="horizontal">
              {has_non_vegan_old_receipe || biodynamic ? (
                <Tags>
                  {has_non_vegan_old_receipe && (
                    <Tag type="orange">Ancienne recette non vegan</Tag>
                  )}
                  {biodynamic && <Tag type="orange">Biodynamie</Tag>}
                </Tags>
              ) : (
                <NoDataItem>--</NoDataItem>
              )}
            </DataItem>

            <FullWidth>
              <DataItem label="Description :" type="horizontal">
                {description || <NoDataItem>--</NoDataItem>}
              </DataItem>
            </FullWidth>

            {problem_description && (
              <FullWidth>
                <DataItem label="Problèmes :" type="horizontal">
                  {problem_description}
                </DataItem>
              </FullWidth>
            )}
          </InfoGrid>
        </Section>

        <Section>
          <Pictures>
            <DataItem label="Photo">
              {image ? (
                <ImageZoom
                  src={`${S3_STORAGE_URL}/${image}`}
                  height={30}
                  width={60}
                />
              ) : (
                <NoDataItem>--</NoDataItem>
              )}
            </DataItem>

            <DataItem label="Réponse de la marque">
              {brand_answer ? (
                <ImageZoom
                  src={`${S3_STORAGE_URL}/${brand_answer}`}
                  height={30}
                  width={60}
                />
              ) : (
                <NoDataItem>--</NoDataItem>
              )}
            </DataItem>
          </Pictures>
        </Section>

        <Section>
          <ButtonGroup $variation="end">
            <Button
              $variation="secondary"
              onClick={onSkip}
              disabled={isPublishing}
            >
              <HiOutlineForward /> Passer
            </Button>
            {/* New tab, so that the publication session is not lost */}
            <Button
              as="a"
              href={`/products/${id}`}
              target="_blank"
              rel="noreferrer"
              $variation="info"
            >
              <HiOutlineArrowTopRightOnSquare /> Voir la fiche
            </Button>
            <Button
              $variation="confirm"
              onClick={publish}
              disabled={isPublishing}
            >
              {isPublishing ? <SpinnerMini size="xs" /> : <HiCheck />} Publier
            </Button>
          </ButtonGroup>
        </Section>
      </DataBox>
    </>
  );
}

export default ProductPublisherCard;
