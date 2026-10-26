import styled from "styled-components";
import {
  HiOutlineArrowDownTray,
  HiOutlineArrowUp,
  HiOutlinePlus,
  HiOutlineTrash,
} from "react-icons/hi2";

import Button from "@/ui/Button";
import Input from "@/ui/Input";
import SpinnerMini from "@/ui/SpinnerMini";
import ShopMap from "@/features/shops/ShopMap";
import { useReverseGeocode } from "@/features/shops/useReverseGeocode";

import NearbyRestaurantsLayer from "./NearbyRestaurantsLayer";
import OpeningHoursEditor from "./OpeningHoursEditor";
import { MAX_STOPS, stopTitle, withKey } from "./openingHours";

const Stops = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;

const StopCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1.6rem;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
`;

const StopHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
`;

const StopName = styled.strong`
  font-size: 1.6rem;
  font-weight: 600;
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.4rem;
`;

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
`;

const Coordinates = styled.span`
  font-size: 1.3rem;
  color: var(--color-grey-500);
`;

function StopEditor({
  restaurantId,
  stop,
  index,
  onChange,
  onRemove,
  onMakeFirst,
  disabled,
}) {
  const { fetchAddress, isFetchingAddress } = useReverseGeocode();
  const set = (field) => (value) => onChange({ ...stop, [field]: value });
  const setFromEvent = (field) => (e) => set(field)(e.target.value);

  function handleFetchAddress() {
    fetchAddress(
      { lat: stop.latitude, lng: stop.longitude },
      {
        onSuccess: (data) =>
          onChange({
            ...stop,
            address: data.address || stop.address,
            city: data.city || stop.city,
          }),
      },
    );
  }

  return (
    <StopCard>
      <StopHeader>
        <StopName>
          {index + 1}. {stopTitle(stop)}
          {index === 0 && " (principal)"}
        </StopName>
        <Actions>
          {index > 0 && (
            <Button
              type="button"
              $variation="secondary"
              $size="small"
              onClick={onMakeFirst}
              disabled={disabled}
            >
              <HiOutlineArrowUp /> En faire le principal
            </Button>
          )}
          <Button
            type="button"
            $variation="danger"
            $size="small"
            onClick={onRemove}
            disabled={disabled}
          >
            <HiOutlineTrash /> Retirer
          </Button>
        </Actions>
      </StopHeader>
      <Columns>
        <div>
          <ShopMap
            shopId={restaurantId}
            position={{ lat: stop.latitude, lng: stop.longitude }}
            onPositionChange={({ lat, lng }) =>
              onChange({ ...stop, latitude: lat, longitude: lng })
            }
            existingLayer={
              <NearbyRestaurantsLayer
                restaurant={{
                  id: restaurantId,
                  latitude: stop.latitude,
                  longitude: stop.longitude,
                }}
              />
            }
          />
        </div>
        <Fields>
          <Input
            aria-label="Nom de l'emplacement"
            placeholder="Nom (ex : Marché de Wazemmes)"
            value={stop.label ?? ""}
            onChange={setFromEvent("label")}
            disabled={disabled}
          />
          <Input
            aria-label="Adresse"
            placeholder="Adresse"
            value={stop.address ?? ""}
            onChange={setFromEvent("address")}
            disabled={disabled}
          />
          <Input
            aria-label="Ville"
            placeholder="Ville"
            value={stop.city ?? ""}
            onChange={setFromEvent("city")}
            disabled={disabled}
          />
          <Coordinates>
            {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)} · déplacez
            le repère pour corriger
          </Coordinates>
          <div>
            <Button
              type="button"
              $variation="secondary"
              $size="small"
              onClick={handleFetchAddress}
              disabled={disabled || isFetchingAddress}
            >
              {isFetchingAddress ? (
                <SpinnerMini size="xs" />
              ) : (
                <HiOutlineArrowDownTray />
              )}
              Récupérer l&apos;adresse depuis le repère
            </Button>
          </div>
        </Fields>
      </Columns>
      <OpeningHoursEditor
        value={stop.opening_hours}
        onChange={set("opening_hours")}
        disabled={disabled}
      />
      <Input
        aria-label="Précision sur ses passages"
        placeholder={
          stop.opening_hours.length
            ? "Précision (facultatif, ex : sauf en août)"
            : "Quand y vient-il ? (ex : un samedi sur deux)"
        }
        value={stop.note ?? ""}
        onChange={setFromEvent("note")}
        maxLength={200}
        disabled={disabled}
      />
    </StopCard>
  );
}

// A food truck's weekly stops, each with its position and hours there (none:
// its days there vary). The first one is the restaurant's position.
function StopsEditor({ restaurantId, value, onChange, disabled }) {
  function update(index, stop) {
    onChange(value.map((s, i) => (i === index ? stop : s)));
  }

  function handleAdd() {
    const last = value.at(-1);
    onChange([
      ...value,
      withKey({
        label: null,
        address: null,
        city: last.city,
        latitude: last.latitude,
        longitude: last.longitude,
        opening_hours: [],
        note: null,
      }),
    ]);
  }

  return (
    <Stops>
      {value.map((stop, index) => (
        <StopEditor
          key={stop._key}
          restaurantId={restaurantId}
          stop={stop}
          index={index}
          onChange={(changed) => update(index, changed)}
          onRemove={() => onChange(value.filter((_, i) => i !== index))}
          onMakeFirst={() =>
            onChange([stop, ...value.filter((_, i) => i !== index)])
          }
          disabled={disabled}
        />
      ))}
      {value.length < MAX_STOPS && (
        <div>
          <Button
            type="button"
            $variation="secondary"
            $size="small"
            onClick={handleAdd}
            disabled={disabled}
          >
            <HiOutlinePlus /> Ajouter un emplacement
          </Button>
        </div>
      )}
    </Stops>
  );
}

export default StopsEditor;
