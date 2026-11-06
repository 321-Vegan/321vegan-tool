import { useNavigate } from "react-router-dom";
import { isToday } from "date-fns";

import { formatDate } from "@/utils/helpers";
import { useCurrentUserContext } from "@/contexts/CurrentUserContext";
import { useGoBack } from "@/hooks/useGoBack";
import { useBrand } from "./useBrand";
import { useDeleteBrand } from "./useDeleteBrand";
import { useScoringCategories } from "@/features/scoring/categories/useScoringCategories";
import { getScoresColor } from "@/features/scoring/brands/utils";

import Row from "@/ui/Row";
import Heading from "@/ui/Heading";
import HeaderDetail from "@/ui/HeaderDetail";
import Section from "@/ui/Section";
import DataBox from "@/ui/DataBox";
import DataItem from "@/ui/DataItem";
import NoDataItem from "@/ui/NoDataItem";
import ButtonGroup from "@/ui/ButtonGroup";
import ButtonText from "@/ui/ButtonText";
import Button from "@/ui/Button";
import Tag from "@/ui/Tag";
import Modal from "@/ui/Modal";
import ConfirmAction from "@/ui/ConfirmAction";
import Empty from "@/ui/Empty";
import Spinner from "@/ui/Spinner";
import ImageDetail from "@/ui/ImageDetail";

import BrandScores from "@/features/scoring/brands/BrandScores";
import ManageBrandScoresForm from "@/features/scoring/brands/ManageBrandScoresForm";

import UpdateBrandForm from "./UpdateBrandForm";

import { HiOutlineBuildingOffice, HiOutlineCheckCircle } from "react-icons/hi2";

import styled from "styled-components";

const BrandDataBox = styled(DataBox)`
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
    "name name parent"
    "logo logo email"
    "logo logo contact"
    "bkg bkg bkg"
    "score score boycott";
  gap: 4rem;
  padding-top: 2rem;

  & div:first-child {
    grid-area: name;
  }
  & div:nth-child(2) {
    grid-area: parent;
  }
  & div:nth-child(3) {
    grid-area: logo;
  }
  & div:nth-child(4) {
    grid-area: email;
  }
  & div:nth-child(5) {
    grid-area: contact;
  }
  & div:nth-child(6) {
    grid-area: bkg;
    white-space: pre-wrap;
  }
  & div:nth-child(7) {
    grid-area: score;
  }
  & div:nth-child(8) {
    grid-area: boycott;
  }
`;

function BrandDetail() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { hasAccess } = useCurrentUserContext();
  const { isPending: isPendingBrand, brand, scores } = useBrand();
  const { isDeleting, deleteBrand } = useDeleteBrand();
  const {
    isPending: isPendingCategories,
    categories,
    count: categoriesCount,
  } = useScoringCategories();

  const isPending = isPendingBrand || isPendingCategories;

  if (isPending) return <Spinner />;

  if (!brand) return <Empty message="Marque inconnue" />;

  const {
    id: brandId,
    created_at,
    updated_at,
    name,
    email,
    contact_form_url,
    parent,
    score,
    boycott,
    background,
    logo_path,
  } = brand;

  const scoreColor = getScoresColor(score);

  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">Détail de la marque #{brandId}</Heading>
        <ButtonText onClick={goBack}>&larr; Retour</ButtonText>
      </Row>

      <BrandDataBox>
        <HeaderDetail type={scoreColor}>
          <div>
            <HiOutlineBuildingOffice />
            <p>{name}</p>
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
              label="Nom :"
              type="horizontal"
            >
              {name || <NoDataItem>--</NoDataItem>}
            </DataItem>

            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="Maison mère :"
              type="horizontal"
            >
              {parent ? (
                <ButtonText onClick={() => navigate(`/brands/${parent.id}`)}>
                  {parent.name}
                </ButtonText>
              ) : (
                <NoDataItem>--</NoDataItem>
              )}
            </DataItem>

            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="Logo :"
              type="horizontal"
            >
              <ImageDetail path={logo_path} alt={`Logo ${name}`} size={8} />
            </DataItem>

            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="Adresse e-mail :"
              type="horizontal"
            >
              {email || <NoDataItem>--</NoDataItem>}
            </DataItem>

            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="Formulaire de contact :"
              type="horizontal"
            >
              {contact_form_url ? (
                <ButtonText
                  as="a"
                  href={contact_form_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ouvrir le formulaire
                </ButtonText>
              ) : (
                <NoDataItem>--</NoDataItem>
              )}
            </DataItem>

            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="Informations générales :"
              type="vertical"
            >
              {background || <NoDataItem>--</NoDataItem>}
            </DataItem>

            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="Score éthique :"
              type="horizontal"
            >
              <Tag type={scoreColor}>
                {score !== null ? `${score}%` : "N/A"}
              </Tag>
            </DataItem>

            <DataItem
              icon={<HiOutlineCheckCircle />}
              label="Boycott :"
              type="horizontal"
            >
              {boycott ? (
                <Tag type="red">Oui</Tag>
              ) : (
                <Tag type="green">Non</Tag>
              )}
            </DataItem>
          </InfoBox>
        </Section>

        {scores.length > 0 && (
          <Section>
            <BrandScores categories={categories} scores={scores} />
          </Section>
        )}
      </BrandDataBox>

      {hasAccess("contributor") && (
        <Modal>
          <ButtonGroup $variation="end">
            <Modal.Open opens="edit">
              <Button $variation="accent">Éditer</Button>
            </Modal.Open>

            {categoriesCount && hasAccess("contributor") && (
              <Modal.Open opens="manage-brand-score">
                <Button $variation="primary">
                  {scores.length > 0 ? "Éditer" : "Créer"} le score éthique
                </Button>
              </Modal.Open>
            )}

            <Modal.Open opens="delete">
              <Button $variation="danger" disabled={isDeleting}>
                Supprimer
              </Button>
            </Modal.Open>

            <Button $variation="secondary" onClick={goBack}>
              Retour
            </Button>
          </ButtonGroup>

          <Modal.Window name="edit">
            <UpdateBrandForm brandToUpdate={brand} />
          </Modal.Window>

          <Modal.Window name="manage-brand-score">
            <ManageBrandScoresForm
              brandId={brand.id}
              categories={categories}
              scores={scores}
            />
          </Modal.Window>

          <Modal.Window name="delete">
            <ConfirmAction
              variation="delete"
              title="Supprimer une marque"
              message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer définitivement cette marque ?"
              onConfirm={() =>
                deleteBrand(brandId, {
                  onSettled: () => navigate(-1),
                })
              }
              disabled={isDeleting}
            />
          </Modal.Window>
        </Modal>
      )}
    </>
  );
}

export default BrandDetail;
