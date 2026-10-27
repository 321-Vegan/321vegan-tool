import { useEffect, useState } from "react";
import { isToday } from "date-fns";
import toast from "react-hot-toast";

import {
  PRODUCT_STATUSES,
  PRODUCT_TYPES,
  S3_STORAGE_URL,
} from "@/utils/constants";
import { formatDate } from "@/utils/helpers";
import { getBrandsForSelect } from "@/services/apiBrands";
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
import Input from "@/ui/Input";
import Textarea from "@/ui/Textarea";
import Select from "@/ui/Select";
import Radios from "@/ui/Radios";
import Checkbox from "@/ui/Checkbox";
import Button from "@/ui/Button";
import ButtonGroup from "@/ui/ButtonGroup";
import ImageZoom from "@/ui/ImageZoom";
import Spinner from "@/ui/Spinner";
import SpinnerMini from "@/ui/SpinnerMini";

import CreateBrandForm from "@/features/brands/CreateBrandForm";
import ProblemBox from "./ProblemBox";
import ProductLockedBox from "./ProductLockedBox";

import { PiPlant } from "react-icons/pi";
import {
  HiCheck,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineForward,
} from "react-icons/hi2";
import styled from "styled-components";

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 16rem 1fr;
  align-items: center;
  gap: 1.2rem;
  padding: 0.6rem 0;
`;

const FieldLabel = styled.label`
  font-weight: 500;
`;

const Checkboxes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2.4rem;
`;

const Pictures = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4.8rem;
`;

function Field({ label, htmlFor, children }) {
  return (
    <FieldRow>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
    </FieldRow>
  );
}

// Publication mode: the product has already been verified,
// so its fields can be adjusted on the fly and it is published in one click.
function ProductPublisherCard({ ean, onClose, onSkip }) {
  const { isPending, product, refetch } = useProductByEan(ean);

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

  return (
    <PublisherForm
      // Reset the fields when the product is reloaded after being freed
      key={product.updated_at}
      product={product}
      onClose={onClose}
      onSkip={onSkip}
    />
  );
}

function PublisherForm({ product, onClose, onSkip }) {
  const { id, ean, created_at, image, brand_answer } = product;
  const { isUpdating: isPublishing, updateProduct } = useUpdateProduct();

  const [name, setName] = useState(product.name || "");
  const [brandId, setBrandId] = useState(product.brand?.id || null);
  const [status, setStatus] = useState(product.status);
  const [productType, setProductType] = useState(product.product_type);
  const [description, setDescription] = useState(product.description || "");
  const [problems, setProblems] = useState(product.problem_description || "");
  const [biodynamic, setBiodynamic] = useState(Boolean(product.biodynamic));
  const [hasOldReceipe, setHasOldReceipe] = useState(
    Boolean(product.has_non_vegan_old_receipe),
  );

  const isKnown = status !== "NOT_FOUND";
  const shouldShowProblems = ["MAYBE_VEGAN", "NON_VEGAN"].includes(status);

  function publish() {
    if (isKnown && !name.trim()) return toast.error("Le nom est obligatoire");
    if (isKnown && !brandId) return toast.error("La marque est obligatoire");
    if (shouldShowProblems && !problems.trim())
      return toast.error(
        "Les problèmes sont obligatoires pour un produit maybe vegan ou non vegan",
      );

    updateProduct(
      {
        newData: {
          ...product,
          state: "PUBLISHED",
          name,
          brand: null,
          brand_id: brandId,
          status,
          product_type: productType,
          description,
          problem_description: shouldShowProblems ? problems : null,
          biodynamic,
          has_non_vegan_old_receipe: hasOldReceipe,
        },
        id,
      },
      { onSuccess: () => onClose() },
    );
  }

  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">{product.name || `Produit #${ean}`}</Heading>
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
          <Fields>
            <Field label="Statut">
              <Radios id="status" onChange={setStatus} defaultValue={status}>
                {Object.entries(PRODUCT_STATUSES).map(([key, o]) => (
                  <Radios.RadioButton
                    key={key}
                    value={key}
                    color={o.color}
                    disabled={isPublishing}
                  >
                    {o.label}
                  </Radios.RadioButton>
                ))}
              </Radios>
            </Field>

            <Field label="Type">
              <Radios
                id="product_type"
                onChange={setProductType}
                defaultValue={productType}
              >
                {Object.entries(PRODUCT_TYPES).map(([key, o]) => (
                  <Radios.RadioButton
                    key={key}
                    value={key}
                    color={o.color}
                    disabled={isPublishing}
                  >
                    {o.label}
                  </Radios.RadioButton>
                ))}
              </Radios>
            </Field>

            <Field label="Nom" htmlFor="name">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPublishing}
              />
            </Field>

            <Field label="Marque" htmlFor="brand_id">
              <Select
                name="brand_id"
                onChange={setBrandId}
                getOptions={getBrandsForSelect}
                defaultOptions={
                  product.brand
                    ? [{ value: product.brand.id, label: product.brand.name }]
                    : []
                }
                defaultValue={[brandId]}
                disabled={isPublishing}
                isSearchable={true}
                isNullable={true}
                createComponent={<CreateBrandForm prefillName={name} />}
              />
            </Field>

            <Field label="Description" htmlFor="description">
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPublishing}
              />
            </Field>

            {shouldShowProblems && (
              <Field label="Problèmes" htmlFor="problem_description">
                <ProblemBox
                  defaultValue={problems}
                  onChange={(_, value) => setProblems(value)}
                >
                  <Textarea
                    id="problem_description"
                    value={problems}
                    onChange={(e) => setProblems(e.target.value)}
                    disabled={isPublishing}
                  />
                </ProblemBox>
              </Field>
            )}

            <Field label="Particularités">
              <Checkboxes>
                <Checkbox
                  name="has_non_vegan_old_receipe"
                  checked={hasOldReceipe}
                  onChange={(e) => setHasOldReceipe(e.target.checked)}
                  disabled={isPublishing}
                >
                  Ancienne recette non vegan
                </Checkbox>
                <Checkbox
                  name="biodynamic"
                  checked={biodynamic}
                  onChange={(e) => setBiodynamic(e.target.checked)}
                  disabled={isPublishing}
                >
                  Biodynamie
                </Checkbox>
              </Checkboxes>
            </Field>
          </Fields>
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
      </DataBox>
    </>
  );
}

export default ProductPublisherCard;
