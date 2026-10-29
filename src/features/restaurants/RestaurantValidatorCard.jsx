import { useState } from "react";
import {
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineTrash,
  HiOutlineArrowDownTray,
  HiOutlineArrowTopRightOnSquare,
  HiCheck,
} from "react-icons/hi2";
import styled from "styled-components";

import { formatDate, formatDistanceFromNow } from "@/utils/helpers";

import Admonition from "@/ui/Admonition";
import Button from "@/ui/Button";
import Checkbox from "@/ui/Checkbox";
import DataItem from "@/ui/DataItem";
import Heading from "@/ui/Heading";
import Input from "@/ui/Input";
import Select from "@/ui/Select";
import Textarea from "@/ui/Textarea";
import Modal from "@/ui/Modal";
import SpinnerMini from "@/ui/SpinnerMini";
import ShopMap from "@/features/shops/ShopMap";
import UserInfo from "@/features/users/UserInfo";
import { useReverseGeocode } from "@/features/shops/useReverseGeocode";
import DeleteRestaurantWindow from "./DeleteRestaurantWindow";
import NearbyRestaurantsLayer from "./NearbyRestaurantsLayer";
import OpeningHoursEditor from "./OpeningHoursEditor";
import StopsList from "./StopsList";
import RestaurantPhotoGallery from "./RestaurantPhotoGallery";
import { useNearbyRestaurants } from "./useNearbyRestaurants";
import { useFeatureRestaurantPhoto } from "./useFeatureRestaurantPhoto";
import { useModerateRestaurantPhoto } from "./useModerateRestaurantPhoto";
import AddRestaurantPhotoButtons from "./AddRestaurantPhotoButtons";
import {
  MAX_PLANT_MILK_SURCHARGE,
  findProblems,
  toFormValues,
  toOptions,
  toPayload,
} from "./restaurantForm";
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

  &:has(textarea) {
    align-items: start;
  }
`;

const FieldLabel = styled.label`
  font-weight: 500;
`;

const Hint = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-500);
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 2.4rem;
`;

const Inline = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem 1.6rem;
`;

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;

  & input {
    flex: 1;
  }
`;

function Field({ label, htmlFor, hint, children }) {
  return (
    <FieldRow>
      <div>
        <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
        {hint && <Hint>{hint}</Hint>}
      </div>
      {children}
    </FieldRow>
  );
}

// An input with a link to open its address, to check it
function LinkInput({ value, href, ...props }) {
  const url = href ?? (/^https?:\/\//.test(value) ? value : `https://${value}`);
  return (
    <LinkRow>
      <Input value={value} {...props} />
      {value.trim() && (
        <a href={url} target="_blank" rel="noreferrer" aria-label="Ouvrir">
          <HiOutlineArrowTopRightOnSquare />
        </a>
      )}
    </LinkRow>
  );
}

function RestaurantValidatorCard({
  restaurant,
  onValidate,
  onDelete,
  isProcessing,
}) {
  const { created_at } = restaurant;

  // Same form as the restaurant page
  const [values, setValues] = useState(() => toFormValues(restaurant));
  const set = (field) => (value) =>
    setValues((current) => ({ ...current, [field]: value }));
  const setFromEvent = (field) => (e) => set(field)(e.target.value);

  const payload = toPayload(values);
  const problems = findProblems(payload);
  const fullyVegan = values.vegan_status === "FULLY_VEGAN";
  // A food truck's position, address and hours come from its stops
  const hasStops = values.stops.length > 0;

  function toggleServiceOption(option) {
    set("service_options")(
      values.service_options.includes(option)
        ? values.service_options.filter((o) => o !== option)
        : [...values.service_options, option],
    );
  }

  // Kept locally: the validator works on a snapshot of the restaurants
  const [photos, setPhotos] = useState(restaurant.photos);
  const [featuredId, setFeaturedId] = useState(
    photos.find((photo) => photo.is_featured)?.id,
  );
  const { featurePhoto, isFeaturing } = useFeatureRestaurantPhoto();
  const { deletePhoto, isWorking: isDeletingPhoto } =
    useModerateRestaurantPhoto();

  function handleFeature(photo) {
    featurePhoto(
      { restaurantId: restaurant.id, photoId: photo.id },
      { onSuccess: () => setFeaturedId(photo.id) },
    );
  }

  function handleDeletePhoto(photo) {
    deletePhoto(
      { restaurantId: restaurant.id, photoId: photo.id },
      {
        onSuccess: () => {
          setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
          if (photo.id === featuredId) setFeaturedId(undefined);
        },
      },
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
    fetchAddress(
      { lat: values.latitude, lng: values.longitude },
      {
        onSuccess: (data) =>
          setValues((current) => ({
            ...current,
            address: data.address || current.address,
            city: data.city || current.city,
            country: data.country || current.country,
          })),
      },
    );
  }

  return (
    <Card>
      {(duplicates.length > 0 ||
        (values.vegan_status === "VEGAN_OPTIONS" && !hasMenuPhoto)) && (
        <FullWidth>
          {duplicates.length > 0 && (
            <Admonition variation="danger" icon="warning">
              Doublon possible à moins de {DUPLICATE_RADIUS_METERS} m :{" "}
              {duplicates
                .map((d) => `${d.name}${d.validated ? "" : " (en attente)"}`)
                .join(", ")}
            </Admonition>
          )}
          {values.vegan_status === "VEGAN_OPTIONS" && !hasMenuPhoto && (
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
          position={{ lat: values.latitude, lng: values.longitude }}
          onPositionChange={({ lat, lng }) =>
            setValues((current) => ({
              ...current,
              latitude: lat,
              longitude: lng,
            }))
          }
          existingLayer={<NearbyRestaurantsLayer restaurant={restaurant} />}
          draggable={!hasStops}
        />

        {hasStops ? (
          <Admonition variation="info" icon="hint">
            Food truck à {values.stops.length} emplacements : la carte montre
            le principal. Position, adresse et horaires se corrigent dans la
            fiche.
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
            value={values.name}
            onChange={setFromEvent("name")}
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
            value={values.address}
            onChange={setFromEvent("address")}
            disabled={isProcessing || hasStops}
            placeholder={
              values.has_storefront ? "Adresse du lieu" : "Non publiée"
            }
          />
        </Field>

        <Field label="Ville" htmlFor="city">
          <Input
            id="city"
            value={values.city}
            onChange={setFromEvent("city")}
            disabled={isProcessing || hasStops}
            placeholder="Ville"
          />
        </Field>

        <Field label="Pays" htmlFor="country">
          <Input
            id="country"
            value={values.country}
            onChange={setFromEvent("country")}
            disabled={isProcessing}
            placeholder="Pays"
          />
        </Field>

        <Field label="Type" htmlFor="tags">
          <Select
            name="tags"
            onChange={set("tags")}
            defaultValue={values.tags}
            defaultOptions={RESTAURANT_TAGS}
            isMulti
            disabled={isProcessing}
          />
        </Field>

        <Field label="Végane" htmlFor="vegan_status">
          <Select
            name="vegan_status"
            onChange={set("vegan_status")}
            defaultValue={[values.vegan_status]}
            defaultOptions={toOptions(VEGAN_STATUSES)}
            disabled={isProcessing}
          />
        </Field>

        <Field label="Options véganes" htmlFor="vegan_options_details">
          <Textarea
            id="vegan_options_details"
            value={values.vegan_options_details}
            onChange={setFromEvent("vegan_options_details")}
            disabled={isProcessing}
            placeholder={
              fullyVegan
                ? "Facultatif pour un lieu 100 % végane"
                : "Obligatoire : quelles options, comment elles sont signalées"
            }
          />
        </Field>

        <Field label="Description" htmlFor="description">
          <Textarea
            id="description"
            value={values.description}
            onChange={setFromEvent("description")}
            disabled={isProcessing}
            placeholder="Description du lieu"
          />
        </Field>

        {problems.length > 0 && (
          <Admonition variation="danger" icon="warning">
            {problems.join(" ")}
          </Admonition>
        )}

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
                name={values.name}
                onDelete={onDelete}
                disabled={isProcessing}
              />
            </Modal.Window>
          </Modal>

          <Button
            onClick={() => onValidate(payload)}
            disabled={isProcessing || problems.length > 0}
          >
            <HiCheck /> Valider
          </Button>
        </Actions>
      </Details>

      <FullWidth>
        <InfoGrid>
          <div>
            <Heading as="h3">Le lieu</Heading>
            <Field label="Possibilités">
              <Inline>
                {SERVICE_OPTIONS.map((option) => (
                  <Checkbox
                    key={option.value}
                    name={`service-${option.value}`}
                    checked={values.service_options.includes(option.value)}
                    onChange={() => toggleServiceOption(option.value)}
                    disabled={isProcessing}
                  >
                    {option.label}
                  </Checkbox>
                ))}
              </Inline>
            </Field>
            <Field label="Sans gluten">
              <Checkbox
                name="has_gluten_free_options"
                checked={values.has_gluten_free_options}
                onChange={(e) =>
                  set("has_gluten_free_options")(e.target.checked)
                }
                disabled={isProcessing}
              >
                Au moins une option végane est aussi sans gluten
              </Checkbox>
            </Field>
            {!fullyVegan && (
              <Field
                label="Lait végétal"
                htmlFor="plant_milk_surcharge"
                hint="Supplément en €. 0 : aucun, négatif : moins cher. Vide : inconnu."
              >
                <div>
                  <Input
                    id="plant_milk_surcharge"
                    type="number"
                    step="0.05"
                    min={-MAX_PLANT_MILK_SURCHARGE}
                    max={MAX_PLANT_MILK_SURCHARGE}
                    value={
                      values.no_hot_drinks ? "" : values.plant_milk_surcharge
                    }
                    onChange={setFromEvent("plant_milk_surcharge")}
                    disabled={isProcessing || values.no_hot_drinks}
                  />
                  <Checkbox
                    name="no_hot_drinks"
                    checked={values.no_hot_drinks}
                    onChange={(e) => set("no_hot_drinks")(e.target.checked)}
                    disabled={isProcessing}
                  >
                    Pas de boissons chaudes
                  </Checkbox>
                </div>
              </Field>
            )}
            <Field label="Boutique">
              <Checkbox
                name="has_storefront"
                checked={values.has_storefront}
                onChange={(e) => set("has_storefront")(e.target.checked)}
                disabled={isProcessing}
              >
                Accueille du public (décocher pour un traiteur sans boutique)
              </Checkbox>
            </Field>
            {!values.has_storefront && (
              <Field
                label="Zone servie"
                htmlFor="service_area"
                hint="Adresse non publiée, position arrondie à ~1 km"
              >
                <Input
                  id="service_area"
                  value={values.service_area}
                  onChange={setFromEvent("service_area")}
                  placeholder="Ex : Lyon et alentours"
                  disabled={isProcessing}
                />
              </Field>
            )}
            <Field label="Ouverture" htmlFor="operating_status">
              <Select
                name="operating_status"
                onChange={set("operating_status")}
                defaultValue={[values.operating_status]}
                defaultOptions={toOptions(OPERATING_STATUSES)}
                disabled={isProcessing}
              />
            </Field>
            {values.operating_status === "TEMPORARILY_CLOSED" && (
              <Field label="Fermé du … au">
                <Inline>
                  <Input
                    id="closed_from"
                    type="date"
                    aria-label="Fermé du"
                    value={values.closed_from}
                    onChange={setFromEvent("closed_from")}
                    disabled={isProcessing}
                  />
                  <Input
                    id="closed_until"
                    type="date"
                    aria-label="Fermé jusqu'au"
                    value={values.closed_until}
                    onChange={setFromEvent("closed_until")}
                    disabled={isProcessing}
                  />
                </Inline>
              </Field>
            )}
            {values.operating_status !== "OPEN" && (
              <Field label="Note fermeture" htmlFor="closure_note">
                <Input
                  id="closure_note"
                  value={values.closure_note}
                  onChange={setFromEvent("closure_note")}
                  placeholder="Ex : travaux, changement de propriétaire…"
                  disabled={isProcessing}
                />
              </Field>
            )}
          </div>
          <div>
            <Heading as="h3">Contact</Heading>
            <Field label="Téléphone" htmlFor="phone">
              <LinkInput
                id="phone"
                type="tel"
                value={values.phone}
                href={`tel:${values.phone}`}
                onChange={setFromEvent("phone")}
                disabled={isProcessing}
              />
            </Field>
            <Field label="Site web" htmlFor="website">
              <LinkInput
                id="website"
                value={values.website}
                onChange={setFromEvent("website")}
                disabled={isProcessing}
              />
            </Field>
            <Field label="Facebook" htmlFor="facebook">
              <LinkInput
                id="facebook"
                value={values.facebook}
                onChange={setFromEvent("facebook")}
                disabled={isProcessing}
              />
            </Field>
            <Field label="Instagram" htmlFor="instagram">
              <LinkInput
                id="instagram"
                value={values.instagram}
                onChange={setFromEvent("instagram")}
                disabled={isProcessing}
              />
            </Field>
            <Field label="Lien du menu" htmlFor="menu_url">
              <LinkInput
                id="menu_url"
                value={values.menu_url}
                onChange={setFromEvent("menu_url")}
                disabled={isProcessing}
              />
            </Field>
          </div>
        </InfoGrid>

        <Heading as="h3">{hasStops ? "Emplacements" : "Horaires"}</Heading>
        {hasStops ? (
          <StopsList stops={values.stops} />
        ) : (
          <OpeningHoursEditor
            value={values.opening_hours}
            onChange={set("opening_hours")}
            disabled={isProcessing}
          />
        )}
        <Field label="Note" htmlFor="opening_hours_note">
          <Input
            id="opening_hours_note"
            value={values.opening_hours_note}
            onChange={setFromEvent("opening_hours_note")}
            disabled={isProcessing}
            placeholder="Ex : horaires du restaurant de l'hôtel, fermé en août…"
          />
        </Field>

        <Heading as="h3">Photos</Heading>
        <RestaurantPhotoGallery
          photos={photos}
          featuredId={featuredId}
          onFeature={handleFeature}
          onDelete={handleDeletePhoto}
          disabled={isProcessing || isFeaturing || isDeletingPhoto}
        />
        <AddRestaurantPhotoButtons
          restaurantId={restaurant.id}
          photos={photos}
          onAdded={(photo) => setPhotos((prev) => [...prev, photo])}
          disabled={isProcessing}
        />
      </FullWidth>
    </Card>
  );
}

export default RestaurantValidatorCard;
