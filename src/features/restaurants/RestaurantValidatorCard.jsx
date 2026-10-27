import { useState } from "react";
import {
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineTrash,
  HiOutlineArrowDownTray,
  HiCheck,
} from "react-icons/hi2";
import styled from "styled-components";

import { formatDate, formatDistanceFromNow } from "@/utils/helpers";

import Admonition from "@/ui/Admonition";
import Button from "@/ui/Button";
import DataItem from "@/ui/DataItem";
import Heading from "@/ui/Heading";
import Input from "@/ui/Input";
import NoDataItem from "@/ui/NoDataItem";
import Select from "@/ui/Select";
import Tag from "@/ui/Tag";
import Textarea from "@/ui/Textarea";
import Modal from "@/ui/Modal";
import SpinnerMini from "@/ui/SpinnerMini";
import ShopMap from "@/features/shops/ShopMap";
import UserInfo from "@/features/users/UserInfo";
import { useReverseGeocode } from "@/features/shops/useReverseGeocode";
import DeleteRestaurantWindow from "./DeleteRestaurantWindow";
import NearbyRestaurantsLayer from "./NearbyRestaurantsLayer";
import OpeningHoursList from "./OpeningHoursList";
import StopsList from "./StopsList";
import RestaurantPhotoGallery from "./RestaurantPhotoGallery";
import { useNearbyRestaurants } from "./useNearbyRestaurants";
import { useFeatureRestaurantPhoto } from "./useFeatureRestaurantPhoto";
import {
  DUPLICATE_RADIUS_METERS,
  OPERATING_STATUSES,
  RESTAURANT_TAGS,
  SERVICE_OPTIONS,
  VEGAN_STATUSES,
} from "./restaurantConstants";

const Card = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.4rem;
  padding: 2.4rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
`;

const FullWidth = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const NameInput = styled(Input)`
  font-size: 1.8rem;
  font-weight: 600;
  padding: 1rem 1.4rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-top: 1.6rem;
`;

const FetchAddressRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.2rem;
`;

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 12rem 1fr;
  align-items: center;
  gap: 1.2rem;
  padding: 0.6rem 0;
`;

const FieldLabel = styled.label`
  font-weight: 500;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 2.4rem;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

function Field({ label, htmlFor, children }) {
  return (
    <FieldRow>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
    </FieldRow>
  );
}

function ExternalLink({ href, children }) {
  const url = /^https?:\/\//.test(href) ? href : `https://${href}`;
  return (
    <a href={url} target="_blank" rel="noreferrer">
      {children || href}
    </a>
  );
}

function formatSurcharge(value) {
  if (value === null || value === undefined) return null;
  if (value === 0) return "Aucun supplément";
  const amount = Math.abs(value).toFixed(2).replace(".", ",");
  return value > 0
    ? `+${amount} € pour le lait végétal`
    : `Lait végétal moins cher (−${amount} €)`;
}

function RestaurantValidatorCard({
  restaurant,
  onValidate,
  onDelete,
  isProcessing,
}) {
  const { created_at, photos } = restaurant;

  const [name, setName] = useState(restaurant.name || "");
  const [address, setAddress] = useState(restaurant.address || "");
  const [city, setCity] = useState(restaurant.city || "");
  const [country, setCountry] = useState(restaurant.country || "");
  const [tags, setTags] = useState(restaurant.tags);
  const [veganStatus, setVeganStatus] = useState(restaurant.vegan_status);
  const [veganOptionsDetails, setVeganOptionsDetails] = useState(
    restaurant.vegan_options_details || "",
  );
  const [position, setPosition] = useState({
    lat: restaurant.latitude,
    lng: restaurant.longitude,
  });

  // Kept locally: the validator works on a snapshot of the restaurants
  const [featuredId, setFeaturedId] = useState(
    photos.find((photo) => photo.is_featured)?.id,
  );
  const { featurePhoto, isFeaturing } = useFeatureRestaurantPhoto();

  function handleFeature(photo) {
    featurePhoto(
      { restaurantId: restaurant.id, photoId: photo.id },
      { onSuccess: () => setFeaturedId(photo.id) },
    );
  }

  const { restaurants: closeOnes } = useNearbyRestaurants(
    restaurant,
    DUPLICATE_RADIUS_METERS,
  );
  const duplicates = closeOnes.filter((other) => other.id !== restaurant.id);
  const hasMenuPhoto = photos.some((photo) => photo.kind === "MENU");

  const { fetchAddress, isFetchingAddress } = useReverseGeocode();

  function handleFetchAddress() {
    fetchAddress(position, {
      onSuccess: (data) => {
        if (data.address) setAddress(data.address);
        if (data.city) setCity(data.city);
        if (data.country) setCountry(data.country);
      },
    });
  }

  // A food truck's position and address come from its first stop
  const hasStops = restaurant.stops?.length > 0;

  function handleValidate() {
    onValidate({
      name,
      ...(!hasStops && {
        address,
        city,
        latitude: position.lat,
        longitude: position.lng,
      }),
      country,
      tags,
      vegan_status: veganStatus,
      vegan_options_details: veganOptionsDetails,
    });
  }

  const contacts = [
    restaurant.phone && (
      <a key="phone" href={`tel:${restaurant.phone}`}>
        {restaurant.phone}
      </a>
    ),
    restaurant.website && (
      <ExternalLink key="website" href={restaurant.website} />
    ),
    restaurant.facebook && (
      <ExternalLink key="facebook" href={restaurant.facebook}>
        Facebook
      </ExternalLink>
    ),
    restaurant.instagram && (
      <ExternalLink key="instagram" href={restaurant.instagram}>
        Instagram
      </ExternalLink>
    ),
    restaurant.menu_url && (
      <ExternalLink key="menu" href={restaurant.menu_url}>
        Menu
      </ExternalLink>
    ),
  ].filter(Boolean);

  return (
    <Card>
      {(duplicates.length > 0 ||
        (veganStatus === "VEGAN_OPTIONS" && !hasMenuPhoto)) && (
        <FullWidth>
          {duplicates.length > 0 && (
            <Admonition variation="danger" icon="warning">
              Doublon possible à moins de {DUPLICATE_RADIUS_METERS} m :{" "}
              {duplicates
                .map((d) => `${d.name}${d.validated ? "" : " (en attente)"}`)
                .join(", ")}
            </Admonition>
          )}
          {veganStatus === "VEGAN_OPTIONS" && !hasMenuPhoto && (
            <Admonition variation="warning" icon="warning">
              Aucune photo du menu : l&apos;option végane ne peut pas être
              vérifiée.
            </Admonition>
          )}
        </FullWidth>
      )}

      <div>
        <ShopMap
          shopId={restaurant.id}
          position={position}
          onPositionChange={setPosition}
          existingLayer={<NearbyRestaurantsLayer restaurant={restaurant} />}
          draggable={!hasStops}
        />

        {hasStops ? (
          <Admonition variation="info" icon="hint">
            Food truck à {restaurant.stops.length} emplacements : la carte
            montre le principal. Position et adresse se corrigent dans la fiche.
          </Admonition>
        ) : (
          <FetchAddressRow>
            <Button
              $variation="secondary"
              $size="small"
              onClick={handleFetchAddress}
              disabled={isProcessing || isFetchingAddress}
            >
              {isFetchingAddress ? (
                <SpinnerMini size="xs" />
              ) : (
                <HiOutlineArrowDownTray />
              )}
              Récupérer l&apos;adresse
            </Button>
          </FetchAddressRow>
        )}
      </div>

      <Details>
        <Field label="Nom" htmlFor="name">
          <NameInput
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isProcessing}
            placeholder="Nom du lieu"
          />
        </Field>

        <DataItem icon={<HiOutlineCalendar />} label="Créé" type="horizontal">
          {formatDate(created_at)} ({formatDistanceFromNow(created_at)})
        </DataItem>

        <DataItem icon={<HiOutlineUser />} label="Par" type="horizontal">
          <UserInfo
            userId={restaurant.created_by}
            emptyLabel="Import automatique"
          />
        </DataItem>

        <Field label="Adresse" htmlFor="address">
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isProcessing || hasStops}
            placeholder={
              restaurant.has_storefront ? "Adresse du lieu" : "Non publiée"
            }
          />
        </Field>

        <Field label="Ville" htmlFor="city">
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={isProcessing || hasStops}
            placeholder="Ville"
          />
        </Field>

        <Field label="Pays" htmlFor="country">
          <Input
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            disabled={isProcessing}
            placeholder="Pays"
          />
        </Field>

        <Field label="Type" htmlFor="tags">
          <Select
            name="tags"
            onChange={setTags}
            defaultValue={tags}
            defaultOptions={RESTAURANT_TAGS}
            isMulti
            disabled={isProcessing}
          />
        </Field>

        <Field label="Végane" htmlFor="vegan_status">
          <Select
            name="vegan_status"
            onChange={setVeganStatus}
            defaultValue={[veganStatus]}
            defaultOptions={Object.entries(VEGAN_STATUSES).map(
              ([value, { label }]) => ({ value, label }),
            )}
            disabled={isProcessing}
          />
        </Field>

        <Field label="Options véganes" htmlFor="vegan_options_details">
          <Textarea
            id="vegan_options_details"
            value={veganOptionsDetails}
            onChange={(e) => setVeganOptionsDetails(e.target.value)}
            disabled={isProcessing}
            placeholder={
              veganStatus === "VEGAN_OPTIONS"
                ? "Obligatoire : quelles options, comment elles sont signalées"
                : "Facultatif pour un lieu 100 % végane"
            }
          />
        </Field>

        <Actions>
          <Modal>
            <Modal.Open opens="delete">
              <Button $variation="danger" disabled={isProcessing}>
                <HiOutlineTrash /> Refuser
              </Button>
            </Modal.Open>
            <Modal.Window name="delete">
              <DeleteRestaurantWindow
                restaurant={restaurant}
                name={name}
                onDelete={onDelete}
                disabled={isProcessing}
              />
            </Modal.Window>
          </Modal>

          <Button onClick={handleValidate} disabled={isProcessing}>
            <HiCheck /> Valider
          </Button>
        </Actions>
      </Details>

      <FullWidth>
        <Heading as="h3">Informations</Heading>
        <InfoGrid>
          <div>
            <DataItem label="Description">
              {restaurant.description || <NoDataItem>--</NoDataItem>}
            </DataItem>
            <DataItem label="Contacts">
              {contacts.length ? (
                <Tags>{contacts}</Tags>
              ) : (
                <NoDataItem>--</NoDataItem>
              )}
            </DataItem>
            <DataItem label="Possibilités">
              {restaurant.service_options?.length ? (
                SERVICE_OPTIONS.filter((o) =>
                  restaurant.service_options.includes(o.value),
                )
                  .map((o) => o.label)
                  .join(", ")
              ) : (
                <NoDataItem>Inconnues</NoDataItem>
              )}
            </DataItem>
            <DataItem label="Sans gluten">
              {restaurant.has_gluten_free_options ? (
                "Options sans gluten"
              ) : (
                <NoDataItem>Non indiqué</NoDataItem>
              )}
            </DataItem>
            <DataItem label="Lait végétal">
              {formatSurcharge(restaurant.plant_milk_surcharge) ||
                (restaurant.serves_hot_drinks === false ? (
                  "Pas de boissons chaudes"
                ) : (
                  <NoDataItem>Inconnu</NoDataItem>
                ))}
            </DataItem>
            {!restaurant.has_storefront && (
              <DataItem label="Sans boutique">
                Zone servie : {restaurant.service_area}
              </DataItem>
            )}
            <DataItem label="Ouverture">
              <Tags>
                <Tag type={OPERATING_STATUSES[restaurant.operating_status].color}>
                  {OPERATING_STATUSES[restaurant.operating_status].label}
                </Tag>
                {restaurant.closure_note}
              </Tags>
            </DataItem>
          </div>
          <div>
            {hasStops ? (
              <DataItem label="Emplacements">
                <StopsList stops={restaurant.stops} />
              </DataItem>
            ) : (
              <DataItem label="Horaires">
                <OpeningHoursList slots={restaurant.opening_hours} />
              </DataItem>
            )}
            {restaurant.opening_hours_note && (
              <DataItem label="Note">{restaurant.opening_hours_note}</DataItem>
            )}
          </div>
        </InfoGrid>

        <Heading as="h3">Photos</Heading>
        <RestaurantPhotoGallery
          photos={photos}
          featuredId={featuredId}
          onFeature={handleFeature}
          disabled={isProcessing || isFeaturing}
        />
      </FullWidth>
    </Card>
  );
}

export default RestaurantValidatorCard;
