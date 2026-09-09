import { useNavigate } from "react-router-dom";
import { isToday } from "date-fns";

import { formatDate } from "@/utils/helpers";
import {
  PRODUCT_STATUSES,
  PRODUCT_STATES,
  PRODUCT_TYPES,
  S3_STORAGE_URL,
} from "@/utils/constants";
import { useCurrentUserContext } from "@/contexts/CurrentUserContext";
import { useGoBack } from "@/hooks/useGoBack";
import { useProduct } from "./useProduct";
import { useUpdateProduct } from "./useUpdateProduct";
import { useDeleteProduct } from "./useDeleteProduct";

import Row from "@/ui/Row";
import Heading from "@/ui/Heading";
import HeaderDetail from "@/ui/HeaderDetail";
import Section from "@/ui/Section";
import DataBox from "@/ui/DataBox";
import ButtonGroup from "@/ui/ButtonGroup";
import ButtonText from "@/ui/ButtonText";
import Button from "@/ui/Button";
import Tag from "@/ui/Tag";
import Modal from "@/ui/Modal";
import ConfirmAction from "@/ui/ConfirmAction";
import DataItem from "@/ui/DataItem";
import NoDataItem from "@/ui/NoDataItem";
import Empty from "@/ui/Empty";
import Spinner from "@/ui/Spinner";
import ImageZoom from "@/ui/ImageZoom";

import UpdateProductForm from "./UpdateProductForm";
import CheckingTable from "@/features/checkings/CheckingTable";
import CreateCheckingForm from "@/features/checkings/CreateCheckingForm";
import GenerateCheckingMessage from "@/features/checkings/GenerateCheckingMessage";

import { PiPlant } from "react-icons/pi";
import { HiOutlineCheckCircle } from "react-icons/hi2";

import styled from "styled-components";

const ProductDataBox = styled(DataBox)`
  & > section:last-child {
    padding-top: 0;
    padding-bottom: 4rem;
  }
`;

const SmallBox = styled.div`
  font-size: 1.4rem;
`;

const InfoBox = styled.div`
  display: grid;
  grid-template-areas:
    "state status type"
    "off off off"
    "name name brand"
    "description description description"
    "old old biodynamic"
    "problem problem problem"
    "img img img";
  gap: 4rem;

  & div:first-child {
    grid-area: state;
  }
  & div:nth-child(2) {
    grid-area: status;
  }
  & div:nth-child(3) {
    grid-area: type;
  }
  & div:nth-child(4) {
    grid-area: off;
  }
  & div:nth-child(5) {
    grid-area: name;
  }
  & div:nth-child(6) {
    grid-area: brand;
  }
  & div:nth-child(7) {
    grid-area: description;
  }
  & div:nth-child(8) {
    grid-area: old;
  }
  & div:nth-child(9) {
    grid-area: biodynamic;
  }
  & div:nth-child(10) {
    grid-area: problem;
  }

  & div:last-child {
    grid-area: img;
    padding-bottom: 4rem;
  }
`;

function ProductDetail() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { isPending, product } = useProduct();
  const { isUpdating: isPublishing, updateProduct } = useUpdateProduct();
  const { isDeleting, deleteProduct } = useDeleteProduct();
  const { hasAccess } = useCurrentUserContext();

  const isWorking = isPublishing || isDeleting;

  function publish() {
    updateProduct({
      newData: { ...product, state: "PUBLISHED" },
      id: product.id,
    });
  }

  if (isPending) return <Spinner />;

  if (!product) return <Empty message="Produit inconnu" />;

  const {
    id: productId,
    created_at,
    updated_at,
    ean,
    name,
    brand,
    status,
    state,
    product_type,
    description,
    problem_description,
    created_from_off,
    checkings,
    has_non_vegan_old_receipe,
    biodynamic,
    image,
  } = product;

  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">Détail du produit #{productId}</Heading>
        <ButtonText onClick={goBack}>&larr; Retour</ButtonText>
      </Row>

      <ProductDataBox>
        <HeaderDetail type={PRODUCT_STATUSES[status].color}>
          <div>
            <PiPlant />
            <p>
              Ean <span>{ean}</span>
            </p>
          </div>

          <SmallBox>
            <p>
              Ajouté le :
              {isToday(new Date(created_at))
                ? " Aujourd'hui"
                : formatDate(created_at, " dd/MM/yyyy")}
            </p>
            <p>
              Modifié le :
              {isToday(new Date(updated_at))
                ? " Aujourd'hui"
                : formatDate(updated_at, " dd/MM/yyyy")}
            </p>
          </SmallBox>
        </HeaderDetail>

        <Section>
          <InfoBox>
            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="État :"
              type="horizontal"
            >
              <Tag type={PRODUCT_STATES[state].color}>
                {PRODUCT_STATES[state].label}
              </Tag>
            </DataItem>

            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="Statut :"
              type="horizontal"
            >
              <Tag type={PRODUCT_STATUSES[status].color}>
                {PRODUCT_STATUSES[status].label}
              </Tag>
            </DataItem>

            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="Type :"
              type="horizontal"
            >
              <Tag type={PRODUCT_TYPES[product_type].color}>
                {PRODUCT_TYPES[product_type].label}
              </Tag>
            </DataItem>

            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="Créé depuis OpenFoodFacts :"
              type="horizontal"
            >
              <Tag type={created_from_off ? "green" : "red"}>
                {created_from_off ? "OUI" : "NON"}
              </Tag>
            </DataItem>

            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="Dénomination :"
              type="horizontal"
            >
              {name || <NoDataItem>--</NoDataItem>}
            </DataItem>

            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="Marque :"
              type="horizontal"
            >
              {brand ? (
                hasAccess("contributor") ? (
                  <ButtonText onClick={() => navigate(`/brands/${brand.id}`)}>
                    {brand.name}
                  </ButtonText>
                ) : (
                  brand.name
                )
              ) : (
                <NoDataItem>--</NoDataItem>
              )}
            </DataItem>
            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="Description :"
              type="horizontal"
            >
              {description || <NoDataItem>--</NoDataItem>}
            </DataItem>

            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="A une ancienne recette non vegan ?"
              type="horizontal"
            >
              <Tag type={has_non_vegan_old_receipe ? "orange" : "red"}>
                {has_non_vegan_old_receipe ? "OUI" : "NON"}
              </Tag>
            </DataItem>

            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="Agriculture biodynamique ?"
              type="horizontal"
            >
              <Tag type={biodynamic ? "orange" : "red"}>
                {biodynamic ? "OUI" : "NON"}
              </Tag>
            </DataItem>

            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="Problèmes :"
              type="horizontal"
            >
              {problem_description || <NoDataItem>--</NoDataItem>}
            </DataItem>

            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="Photo :"
              type="horizontal"
            >
              {image ? (
                <ImageZoom
                  src={`${S3_STORAGE_URL}/${image}`}
                  height={40}
                  width={80}
                />
              ) : (
                <NoDataItem>--</NoDataItem>
              )}
            </DataItem>
          </InfoBox>
        </Section>

        <Section>
          <DataItem
            icon={<HiOutlineCheckCircle />}
            label="Prises de contact :"
            type="vertical"
          >
            <CheckingTable checkings={checkings} product={product} />
          </DataItem>
        </Section>
      </ProductDataBox>

      <Modal>
        <ButtonGroup $variation="end">
          {hasAccess("contributor") && (
            <Button
              $variation="info"
              onClick={() => navigate(`/products/register/${ean}`)}
            >
              Vérifier
            </Button>
          )}
          {hasAccess("admin") && state === "WAITING_PUBLISH" && (
            <Modal.Open opens="publish">
              <Button $variation="confirm" disabled={isWorking}>
                Publier
              </Button>
            </Modal.Open>
          )}
          {hasAccess("contributor") && (
            <>
              {["NEED_CONTACT", "WAITING_BRAND_REPLY"].includes(state) && (
                <>
                  <Modal.Open opens="generate-email">
                    <Button $variation="warning">Générer un message</Button>
                  </Modal.Open>

                  <Modal.Open opens="register-request">
                    <Button $variation="warning">Contacter</Button>
                  </Modal.Open>
                </>
              )}
              <Modal.Open opens="edit">
                <Button $variation="accent">Éditer</Button>
              </Modal.Open>

              <Modal.Open opens="delete">
                <Button $variation="danger" disabled={isWorking}>
                  Supprimer
                </Button>
              </Modal.Open>
            </>
          )}
          <Button $variation="secondary" onClick={goBack}>
            Retour
          </Button>
        </ButtonGroup>

        <Modal.Window name="edit">
          <UpdateProductForm productToUpdate={product} />
        </Modal.Window>

        <Modal.Window name="generate-email">
          <GenerateCheckingMessage product={product} />
        </Modal.Window>

        <Modal.Window name="register-request">
          <CreateCheckingForm product={product} />
        </Modal.Window>

        <Modal.Window name="publish">
          <ConfirmAction
            variation="confirm"
            title="Publier un produit"
            message="Êtes-vous sûr de vouloir publier ce produit ?"
            onConfirm={() => publish()}
            disabled={isWorking}
          />
        </Modal.Window>

        <Modal.Window name="delete">
          <ConfirmAction
            variation="delete"
            title="Supprimer un produit"
            message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer définitivement ce produit ?"
            onConfirm={() =>
              deleteProduct(productId, {
                onSettled: () => navigate(-1),
              })
            }
            disabled={isWorking}
          />
        </Modal.Window>
      </Modal>
    </>
  );
}

export default ProductDetail;
