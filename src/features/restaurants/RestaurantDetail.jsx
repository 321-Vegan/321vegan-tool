import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineArrowDownTray,
  HiOutlineArrowUturnLeft,
  HiOutlineTrash,
  HiOutlineUser,
  HiCheck,
  HiOutlineMapPin,
} from "react-icons/hi2";

import { formatDate, formatDistanceFromNow } from "@/utils/helpers";
import { useCurrentUserContext } from "@/contexts/CurrentUserContext";
import { useGoBack } from "@/hooks/useGoBack";

import Admonition from "@/ui/Admonition";
import Button from "@/ui/Button";
import ButtonText from "@/ui/ButtonText";
import Checkbox from "@/ui/Checkbox";
import DataItem from "@/ui/DataItem";
import Empty from "@/ui/Empty";
import Heading from "@/ui/Heading";
import Input from "@/ui/Input";
import Modal from "@/ui/Modal";
import Row from "@/ui/Row";
import Select from "@/ui/Select";
import Spinner from "@/ui/Spinner";
import SpinnerMini from "@/ui/SpinnerMini";
import Tag from "@/ui/Tag";
import Textarea from "@/ui/Textarea";
import ShopMap from "@/features/shops/ShopMap";
import { useReverseGeocode } from "@/features/shops/useReverseGeocode";
import UserInfo from "@/features/users/UserInfo";

import NearbyRestaurantsLayer from "./NearbyRestaurantsLayer";
import OpeningHoursEditor from "./OpeningHoursEditor";
import { withKey } from "./openingHours";
import {
  MAX_PLANT_MILK_SURCHARGE,
  findProblems,
  text,
  toFormValues,
  toOptions,
  toPayload,
} from "./restaurantForm";
import RestaurantHistory from "./RestaurantHistory";
import RestaurantPhotoGallery from "./RestaurantPhotoGallery";
import AddRestaurantPhotoButtons from "./AddRestaurantPhotoButtons";
import StopsEditor from "./StopsEditor";
import { useRestaurant } from "./useRestaurant";
import { useUpdateRestaurant } from "./useUpdateRestaurant";
import { useDeleteRestaurant } from "./useDeleteRestaurant";
import DeleteRestaurantWindow from "./DeleteRestaurantWindow";
import { useFeatureRestaurantPhoto } from "./useFeatureRestaurantPhoto";
import { useModerateRestaurantPhoto } from "./useModerateRestaurantPhoto";
import {
  OPERATING_STATUSES,
  RESTAURANT_TAGS,
  SERVICE_OPTIONS,
  VEGAN_STATUSES,
} from "./restaurantConstants";

const Card = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 2.4rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.4rem;
`;

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 16rem 1fr;
  align-items: center;
  gap: 1.2rem;
  padding: 0.4rem 0;

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

const Inline = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.6rem;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem 1.6rem;
  font-size: 1.3rem;
  color: var(--color-grey-500);
`;

const CenteredRow = styled.div`
  display: flex;
  justify-content: center;
`;

// Sticks to the bottom of the page so that saving is always at hand
const ActionBar = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1.6rem 2.4rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
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

function RestaurantEditForm({ restaurant, history }) {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { hasAccess } = useCurrentUserContext();
  const { isUpdating, updateRestaurant } = useUpdateRestaurant();
  const { isDeleting, deleteRestaurant } = useDeleteRestaurant();
  const { isFeaturing, featurePhoto } = useFeatureRestaurantPhoto();
  const {
    isWorking: isModeratingPhoto,
    updatePhotoStatus,
    deletePhoto,
  } = useModerateRestaurantPhoto();
  const { fetchAddress, isFetchingAddress } = useReverseGeocode();

  const [initialValues] = useState(() => toFormValues(restaurant));
  const [values, setValues] = useState(initialValues);
  // Bumped to remount the uncontrolled selects when the changes are undone
  const [resetCount, setResetCount] = useState(0);

  const set = (field) => (value) =>
    setValues((current) => ({ ...current, [field]: value }));
  const setFromEvent = (field) => (e) => set(field)(e.target.value);

  const payload = toPayload(values);
  const isDirty =
    JSON.stringify(payload) !== JSON.stringify(toPayload(initialValues));
  const problems = findProblems(payload);
  const isWorking = isUpdating || isDeleting;
  const isWorkingOnPhotos = isFeaturing || isModeratingPhoto;

  const featuredId = restaurant.photos.find((photo) => photo.is_featured)?.id;
  const fullyVegan = values.vegan_status === "FULLY_VEGAN";
  const hasStops = values.stops.length > 0;
  const isFoodTruck = values.tags.includes("food_truck");

  // The current place and hours become its first stop
  function handleSwitchToStops() {
    set("stops")([
      withKey({
        label: null,
        address: text(values.address),
        city: text(values.city),
        latitude: values.latitude,
        longitude: values.longitude,
        opening_hours: values.opening_hours,
        note: null,
      }),
    ]);
  }

  function toggleServiceOption(option) {
    set("service_options")(
      values.service_options.includes(option)
        ? values.service_options.filter((o) => o !== option)
        : [...values.service_options, option],
    );
  }

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

  function handleUndo() {
    setValues(initialValues);
    setResetCount((count) => count + 1);
  }

  function handleSave() {
    updateRestaurant({ id: restaurant.id, newData: payload });
  }

  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">
          {restaurant.name} <small>#{restaurant.id}</small>
        </Heading>
        <ButtonText onClick={goBack}>&larr; Retour</ButtonText>
      </Row>

      <Meta>
        {restaurant.validated ? (
          <Tag type="green">Validé</Tag>
        ) : (
          <Tag type="silver">En attente de validation</Tag>
        )}
        <span>
          Créé le {formatDate(restaurant.created_at)} (
          {formatDistanceFromNow(restaurant.created_at)})
        </span>
        <span>
          Modifié le {formatDate(restaurant.updated_at)} (
          {formatDistanceFromNow(restaurant.updated_at)})
        </span>
        {restaurant.osm_id && <span>OSM {restaurant.osm_id}</span>}
      </Meta>

      {restaurant.created_by && (
        <DataItem icon={<HiOutlineUser />} label="Par" type="horizontal">
          <UserInfo userId={restaurant.created_by} />
        </DataItem>
      )}

      {hasStops ? (
        <Card>
          <Heading as="h3">Le food truck</Heading>
          <Admonition variation="info" icon="hint">
            Il change de lieu selon les jours : la position, l&apos;adresse et
            les horaires se modifient dans ses emplacements, plus bas.
          </Admonition>
          <Field label="Nom" htmlFor="name">
            <Input
              id="name"
              value={values.name}
              onChange={setFromEvent("name")}
              disabled={isWorking}
            />
          </Field>
          <Field label="Pays" htmlFor="country">
            <Input
              id="country"
              value={values.country}
              onChange={setFromEvent("country")}
              disabled={isWorking}
            />
          </Field>
        </Card>
      ) : (
        <Card>
          <Heading as="h3">Emplacement</Heading>
          <Columns>
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
                existingLayer={
                  <NearbyRestaurantsLayer restaurant={restaurant} />
                }
              />
            </div>
            <div>
              <Field label="Nom" htmlFor="name">
                <Input
                  id="name"
                  value={values.name}
                  onChange={setFromEvent("name")}
                  disabled={isWorking}
                />
              </Field>
              <Field label="Adresse" htmlFor="address">
                <Input
                  id="address"
                  value={values.address}
                  onChange={setFromEvent("address")}
                  disabled={isWorking}
                />
              </Field>
              <Field label="Ville" htmlFor="city">
                <Input
                  id="city"
                  value={values.city}
                  onChange={setFromEvent("city")}
                  disabled={isWorking}
                />
              </Field>
              <Field label="Pays" htmlFor="country">
                <Input
                  id="country"
                  value={values.country}
                  onChange={setFromEvent("country")}
                  disabled={isWorking}
                />
              </Field>
              <Field
                label="Position"
                hint="Déplacez le repère sur la carte pour la corriger"
              >
                <span>
                  {values.latitude.toFixed(5)}, {values.longitude.toFixed(5)}
                </span>
              </Field>
              <CenteredRow>
                <Button
                  type="button"
                  $variation="secondary"
                  $size="small"
                  onClick={handleFetchAddress}
                  disabled={isWorking || isFetchingAddress}
                >
                  {isFetchingAddress ? (
                    <SpinnerMini size="xs" />
                  ) : (
                    <HiOutlineArrowDownTray />
                  )}
                  Récupérer l&apos;adresse depuis le repère
                </Button>
              </CenteredRow>
            </div>
          </Columns>
        </Card>
      )}

      <Card key={`place-${resetCount}`}>
        <Heading as="h3">Le lieu</Heading>
        <Field label="Types" htmlFor="tags">
          <Select
            name="tags"
            onChange={set("tags")}
            defaultValue={values.tags}
            defaultOptions={RESTAURANT_TAGS}
            isMulti
            disabled={isWorking}
          />
        </Field>
        <Field label="Végane" htmlFor="vegan_status">
          <Select
            name="vegan_status"
            onChange={set("vegan_status")}
            defaultValue={[values.vegan_status]}
            defaultOptions={toOptions(VEGAN_STATUSES)}
            disabled={isWorking}
          />
        </Field>
        <Field
          label="Options véganes"
          htmlFor="vegan_options_details"
          hint={
            fullyVegan
              ? "Facultatif pour un lieu 100 % végane"
              : "Obligatoire : quelles options, comment elles sont signalées"
          }
        >
          <Textarea
            id="vegan_options_details"
            value={values.vegan_options_details}
            onChange={setFromEvent("vegan_options_details")}
            disabled={isWorking}
          />
        </Field>
        <Field label="Sans gluten">
          <Checkbox
            name="has_gluten_free_options"
            checked={values.has_gluten_free_options}
            onChange={(e) => set("has_gluten_free_options")(e.target.checked)}
            disabled={isWorking}
          >
            Au moins une option végane est aussi sans gluten
          </Checkbox>
        </Field>
        <Field label="Description" htmlFor="description">
          <Textarea
            id="description"
            value={values.description}
            onChange={setFromEvent("description")}
            disabled={isWorking}
          />
        </Field>
        <Field label="Possibilités">
          <Inline>
            {SERVICE_OPTIONS.map((option) => (
              <Checkbox
                key={option.value}
                name={`service-${option.value}`}
                checked={values.service_options.includes(option.value)}
                onChange={() => toggleServiceOption(option.value)}
                disabled={isWorking}
              >
                {option.label}
              </Checkbox>
            ))}
          </Inline>
        </Field>
        {!fullyVegan && (
          <Field
            label="Supplément lait végétal"
            htmlFor="plant_milk_surcharge"
            hint="En €. 0 : pas de supplément, négatif : le lait végétal est moins cher. Vide : inconnu."
          >
            <Input
              id="plant_milk_surcharge"
              type="number"
              step="0.05"
              min={-MAX_PLANT_MILK_SURCHARGE}
              max={MAX_PLANT_MILK_SURCHARGE}
              value={values.no_hot_drinks ? "" : values.plant_milk_surcharge}
              onChange={setFromEvent("plant_milk_surcharge")}
              disabled={isWorking || values.no_hot_drinks}
            />
            <Checkbox
              name="no_hot_drinks"
              checked={values.no_hot_drinks}
              onChange={(e) => set("no_hot_drinks")(e.target.checked)}
              disabled={isWorking}
            >
              Pas de boissons chaudes (pas de supplément à connaître)
            </Checkbox>
          </Field>
        )}
        <Field label="Boutique">
          <Checkbox
            name="has_storefront"
            checked={values.has_storefront}
            onChange={(e) => set("has_storefront")(e.target.checked)}
            disabled={isWorking}
          >
            Accueille du public (décocher pour un traiteur sans boutique)
          </Checkbox>
        </Field>
        {!values.has_storefront && (
          <Field
            label="Zone servie"
            htmlFor="service_area"
            hint="L'adresse n'est pas publiée et la position est arrondie à ~1 km"
          >
            <Input
              id="service_area"
              value={values.service_area}
              onChange={setFromEvent("service_area")}
              placeholder="Ex : Lyon et alentours"
              disabled={isWorking}
            />
          </Field>
        )}
      </Card>

      <Card>
        <Heading as="h3">Contact</Heading>
        <Field label="Téléphone" htmlFor="phone">
          <Input
            id="phone"
            type="tel"
            value={values.phone}
            onChange={setFromEvent("phone")}
            disabled={isWorking}
          />
        </Field>
        <Field label="Site web" htmlFor="website">
          <Input
            id="website"
            value={values.website}
            onChange={setFromEvent("website")}
            disabled={isWorking}
          />
        </Field>
        <Field label="Facebook" htmlFor="facebook">
          <Input
            id="facebook"
            value={values.facebook}
            onChange={setFromEvent("facebook")}
            disabled={isWorking}
          />
        </Field>
        <Field label="Instagram" htmlFor="instagram">
          <Input
            id="instagram"
            value={values.instagram}
            onChange={setFromEvent("instagram")}
            disabled={isWorking}
          />
        </Field>
        <Field label="Lien du menu" htmlFor="menu_url">
          <Input
            id="menu_url"
            value={values.menu_url}
            onChange={setFromEvent("menu_url")}
            disabled={isWorking}
          />
        </Field>
      </Card>

      <Card>
        <Heading as="h3">{hasStops ? "Emplacements" : "Horaires"}</Heading>
        {hasStops ? (
          <StopsEditor
            restaurantId={restaurant.id}
            value={values.stops}
            onChange={set("stops")}
            disabled={isWorking}
          />
        ) : (
          <>
            <OpeningHoursEditor
              value={values.opening_hours}
              onChange={set("opening_hours")}
              disabled={isWorking}
            />
            {isFoodTruck && (
              <div>
                <Button
                  type="button"
                  $variation="secondary"
                  $size="small"
                  onClick={handleSwitchToStops}
                  disabled={isWorking}
                >
                  <HiOutlineMapPin /> Il change de lieu selon les jours : passer
                  aux emplacements
                </Button>
              </div>
            )}
          </>
        )}
        <Field
          label="Note"
          htmlFor="opening_hours_note"
          hint="Ex : horaires du restaurant de l'hôtel, fermé en août…"
        >
          <Input
            id="opening_hours_note"
            value={values.opening_hours_note}
            onChange={setFromEvent("opening_hours_note")}
            disabled={isWorking}
          />
        </Field>
      </Card>

      <Card key={`status-${resetCount}`}>
        <Heading as="h3">Ouverture et validation</Heading>
        <Field label="Ouverture" htmlFor="operating_status">
          <Select
            name="operating_status"
            onChange={set("operating_status")}
            defaultValue={[values.operating_status]}
            defaultOptions={toOptions(OPERATING_STATUSES)}
            disabled={isWorking}
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
                disabled={isWorking}
              />
              <Input
                id="closed_until"
                type="date"
                aria-label="Fermé jusqu'au"
                value={values.closed_until}
                onChange={setFromEvent("closed_until")}
                disabled={isWorking}
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
              disabled={isWorking}
            />
          </Field>
        )}
        <Field label="Validation">
          <Checkbox
            name="validated"
            checked={values.validated}
            onChange={(e) => set("validated")(e.target.checked)}
            disabled={isWorking}
          >
            Validé (visible de tous dans l&apos;appli)
          </Checkbox>
        </Field>
      </Card>

      <ActionBar>
        {isDirty && problems.length > 0 && (
          <Admonition variation="danger" icon="warning">
            {problems.join(" ")}
          </Admonition>
        )}
        <Buttons>
          {hasAccess("admin") && (
            <Modal>
              <Modal.Open opens="delete">
                <Button $variation="danger" disabled={isWorking}>
                  <HiOutlineTrash />{" "}
                  {restaurant.validated ? "Supprimer" : "Refuser"}
                </Button>
              </Modal.Open>
              <Modal.Window name="delete">
                <DeleteRestaurantWindow
                  restaurant={restaurant}
                  onDelete={(rejectionReason) =>
                    deleteRestaurant(
                      { id: restaurant.id, rejectionReason },
                      { onSuccess: () => navigate("/restaurants") },
                    )
                  }
                  disabled={isWorking}
                />
              </Modal.Window>
            </Modal>
          )}
          <Button
            $variation="secondary"
            onClick={handleUndo}
            disabled={isWorking || !isDirty}
          >
            <HiOutlineArrowUturnLeft /> Annuler les changements
          </Button>
          <Button
            onClick={handleSave}
            disabled={isWorking || !isDirty || problems.length > 0}
          >
            {isUpdating ? <SpinnerMini size="xs" /> : <HiCheck />} Enregistrer
          </Button>
        </Buttons>
      </ActionBar>

      <Card>
        <Heading as="h3">Photos</Heading>
        <RestaurantPhotoGallery
          photos={restaurant.photos}
          featuredId={featuredId}
          onFeature={(photo) =>
            featurePhoto({ restaurantId: restaurant.id, photoId: photo.id })
          }
          onModerate={(photo, status) =>
            updatePhotoStatus({ photoId: photo.id, status })
          }
          onDelete={(photo) =>
            deletePhoto({ restaurantId: restaurant.id, photoId: photo.id })
          }
          disabled={isWorkingOnPhotos}
        />
        <AddRestaurantPhotoButtons
          restaurantId={restaurant.id}
          photos={restaurant.photos}
          disabled={isWorkingOnPhotos}
        />
      </Card>

      <Card>
        <Heading as="h3">Historique</Heading>
        <RestaurantHistory history={history} />
      </Card>
    </>
  );
}

// Detail page of a restaurant, editable by the moderators.
function RestaurantDetail() {
  const { isPending, restaurant, history } = useRestaurant();

  if (isPending) return <Spinner />;
  if (!restaurant) return <Empty message="Lieu inconnu" />;

  // Started again from the saved restaurant after each update
  return (
    <RestaurantEditForm
      key={`${restaurant.id}-${restaurant.updated_at}`}
      restaurant={restaurant}
      history={history}
    />
  );
}

export default RestaurantDetail;
