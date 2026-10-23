import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { isToday } from "date-fns";

import { PRODUCT_STATUSES, S3_STORAGE_URL } from "@/utils/constants";
import { formatDate } from "@/utils/helpers";
import { useGoBack } from "@/hooks/useGoBack";
import { getBrandLookalike } from "@/services/apiBrands";
import { getProductData } from "@/services/apiOpenFoodFacts";
import { useProductByEan } from "./useProductByEan";

import Row from "@/ui/Row";
import Heading from "@/ui/Heading";
import HeaderDetail from "@/ui/HeaderDetail";
import Section from "@/ui/Section";
import DataBox from "@/ui/DataBox";
import ButtonText from "@/ui/ButtonText";
import Tag from "@/ui/Tag";
import DataItem from "@/ui/DataItem";
import NoDataItem from "@/ui/NoDataItem";
import HelpAction from "@/ui/HelpAction";
import Spinner from "@/ui/Spinner";
import ImageZoom from "@/ui/ImageZoom";

import IsItVeganHelper from "./IsItVeganHelper";
import OffDataBox from "./OffDataBox";
import RegisterProductForm from "./RegisterProductForm";
import RegisterProductAdmonition from "./RegisterProductAdmonition";
import SearchProductAction from "./SearchProductAction";

import { PiPlant } from "react-icons/pi";
import {
  HiMiniQrCode,
  HiOutlineInformationCircle,
  HiPhoto,
} from "react-icons/hi2";
import styled from "styled-components";

const HelperBox = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

function ProductRegister({
  ean,
  onClose,
  defaultState,
  expectedState = "CREATED",
}) {
  const { productEan } = useParams();
  const finalEan = ean || productEan;
  const { isPending, product } = useProductByEan(finalEan);
  const [isPendingOff, setIsPendingOff] = useState(false);
  const [isPendingBrand, setIsPendingBrand] = useState(true);
  const [errorOff, setErrorOff] = useState("");
  const [offProduct, setOffProduct] = useState(null);
  const [matchedBrand, setMatchedBrand] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState();
  const goBack = useGoBack();
  const handleClose = onClose || goBack;

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsPendingOff(true);
        setErrorOff("");
        setOffProduct(null);
        const data = await getProductData(finalEan);
        setOffProduct(data || {});
      } catch (error) {
        console.error(error);
        setErrorOff(`Ean ${finalEan} inconnu dans Open Food Facts`);
        setOffProduct({});
      } finally {
        setIsPendingOff(false);
      }
    };
    fetchProductData();
  }, [finalEan]);

  useEffect(() => {
    const resolveBrand = async () => {
      if (!product) return;

      if (product.brand) {
        setMatchedBrand(null);
        setIsPendingBrand(false);
        return;
      }

      if (!offProduct) return;

      setIsPendingBrand(true);
      setMatchedBrand(null);

      const findBrand = async (name) => {
        if (!name) return null;

        try {
          return await getBrandLookalike(name);
        } catch (error) {
          console.error(error);
          return null;
        }
      };

      // Prefer the user supplied description over the Open Food Facts brand.
      const description = product.description?.trim();
      let matchingBrand = await findBrand(description);

      if (!matchingBrand) {
        const offBrand =
          offProduct.brands?.split(",")[0] ||
          offProduct.product_name?.split(" - ")[1] ||
          "";
        matchingBrand = await findBrand(offBrand);
      }

      if (matchingBrand)
        setMatchedBrand({
          id: matchingBrand.id,
          name: matchingBrand.name,
          background: matchingBrand.background,
        });

      setIsPendingBrand(false);
    };

    resolveBrand();
  }, [product, offProduct]);

  // Check if the product has been verified while we are on validator mode
  // Because we fetched the products at the start of the session
  const isAlreadyVerified =
    !isPending && product && product.state !== expectedState && onClose;
  useEffect(() => {
    if (isAlreadyVerified) onClose();
  }, [isAlreadyVerified, onClose]);

  if (isPending || isPendingOff || isPendingBrand || isAlreadyVerified)
    return <Spinner />;

  const { created_at, name, status, state, image } = product;

  const {
    brands,
    product_name,
    image_url,
    ingredients_text: ingredients,
    additives_tags: additives,
  } = offProduct || {};

  const offBrandName = brands || product_name?.split(" - ")[1] || "";

  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">Vérification du produit #{finalEan}</Heading>
        {!onClose && <ButtonText onClick={goBack}>&larr; Retour</ButtonText>}
      </Row>

      <DataBox>
        <HeaderDetail type={PRODUCT_STATUSES[status].color}>
          <div>
            <PiPlant />
            <p>
              Ean <span>{finalEan}</span>
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
          <Row type="horizontal">
            <DataItem
              icon={<HiMiniQrCode />}
              label={`Produit ${
                state === "PUBLISHED" ? "validé" : "signalé"
              } comme`}
              type="horizontal"
            >
              <Tag type={PRODUCT_STATUSES[status].color}>
                {PRODUCT_STATUSES[status].label}
              </Tag>
            </DataItem>

            <HelperBox>
              <SearchProductAction ean={finalEan} />

              <HelpAction id="product-register-helper" variante="btn">
                <IsItVeganHelper />
              </HelpAction>
            </HelperBox>
          </Row>
        </Section>

        <Section>
          <DataItem
            icon={<HiPhoto />}
            label="Photo fournie"
            type={image ? "vertical" : "horizontal"}
          >
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
        </Section>

        <Section>
          <DataItem
            icon={<HiOutlineInformationCircle />}
            label="Informations OpenFoodFacts"
          >
            {errorOff ? (
              errorOff
            ) : (
              <OffDataBox
                imageSrc={image_url}
                ingredients={ingredients}
                productName={product_name}
                additives={additives}
                brandName={offBrandName}
              />
            )}
          </DataItem>
        </Section>

        <Section>
          <RegisterProductAdmonition brand={selectedBrand} />
        </Section>

        <Section>
          <RegisterProductForm
            productToCheckedIn={{
              ...product,
              ...(defaultState && { state: defaultState }),
              name: name || product_name,
              brand: product.brand || matchedBrand,
              brandName: offBrandName.split(",")[0],
            }}
            onClose={handleClose}
            onSelectBrand={setSelectedBrand}
          />
        </Section>
      </DataBox>
    </>
  );
}

export default ProductRegister;
