import { useState } from "react";
import {
  HiOutlineCalendar,
  HiOutlineTrash,
  HiOutlineArrowDownTray,
  HiCheck,
} from "react-icons/hi2";
import styled from "styled-components";

import { formatDate, formatDistanceFromNow } from "@/utils/helpers";

import Button from "@/ui/Button";
import DataItem from "@/ui/DataItem";
import Input from "@/ui/Input";
import Select from "@/ui/Select";
import Modal from "@/ui/Modal";
import ConfirmAction from "@/ui/ConfirmAction";
import SpinnerMini from "@/ui/SpinnerMini";
import ShopMap from "./ShopMap";
import { SHOP_TYPES } from "./shopTypes";
import { useReverseGeocode } from "./useReverseGeocode";

const Card = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.4rem;
  padding: 2.4rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
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

const CoordInput = styled(Input)`
  font-size: 1.6rem;
  padding: 1.2rem 1.6rem;
`;

const FetchAddressRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.2rem;
`;

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 9rem 1fr;
  align-items: center;
  gap: 1.2rem;
  padding: 0.6rem 0;
`;

const FieldLabel = styled.label`
  font-weight: 500;
`;

function Field({ label, htmlFor, children }) {
  return (
    <FieldRow>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
    </FieldRow>
  );
}

function ShopValidatorCard({ shop, onValidate, onDelete, isProcessing }) {
  const { created_at } = shop;

  const [name, setName] = useState(shop.name || "");
  const [address, setAddress] = useState(shop.address || "");
  const [city, setCity] = useState(shop.city || "");
  const [country, setCountry] = useState(shop.country || "");
  const [shopType, setShopType] = useState(shop.shop_type || null);
  const [position, setPosition] = useState({
    lat: shop.latitude,
    lng: shop.longitude,
  });

  function handleLatChange(e) {
    const lat = parseFloat(e.target.value);
    if (!Number.isNaN(lat)) setPosition((prev) => ({ ...prev, lat }));
  }

  function handleLngChange(e) {
    const lng = parseFloat(e.target.value);
    if (!Number.isNaN(lng)) setPosition((prev) => ({ ...prev, lng }));
  }

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

  function handleValidate() {
    onValidate({
      name,
      address,
      city,
      country,
      shop_type: shopType,
      latitude: position.lat,
      longitude: position.lng,
    });
  }

  return (
    <Card>
      <div>
        <ShopMap position={position} onPositionChange={setPosition} />

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
            Récupérer l'adresse
          </Button>
        </FetchAddressRow>
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

        <Field label="Adresse" htmlFor="address">
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isProcessing}
            placeholder="Adresse du lieu"
          />
        </Field>

        <Field label="Ville" htmlFor="city">
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={isProcessing}
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

        <Field label="Type" htmlFor="shop_type">
          <Select
            name="shop_type"
            onChange={setShopType}
            defaultValue={[shopType]}
            defaultOptions={SHOP_TYPES}
            isNullable
            disabled={isProcessing}
          />
        </Field>

        <Field label="Latitude" htmlFor="latitude">
          <CoordInput
            id="latitude"
            type="number"
            step="any"
            value={position.lat}
            onChange={handleLatChange}
            disabled={isProcessing}
          />
        </Field>

        <Field label="Longitude" htmlFor="longitude">
          <CoordInput
            id="longitude"
            type="number"
            step="any"
            value={position.lng}
            onChange={handleLngChange}
            disabled={isProcessing}
          />
        </Field>

        <Actions>
          <Modal>
            <Modal.Open opens="delete">
              <Button $variation="danger" disabled={isProcessing}>
                <HiOutlineTrash /> Supprimer
              </Button>
            </Modal.Open>
            <Modal.Window name="delete">
              <ConfirmAction
                variation="delete"
                title="Supprimer ce lieu"
                message={`Êtes-vous sûr de vouloir supprimer "${name}" ? Cette action est irréversible.`}
                btnText="Supprimer"
                onConfirm={onDelete}
                disabled={isProcessing}
              />
            </Modal.Window>
          </Modal>

          <Button onClick={handleValidate} disabled={isProcessing}>
            <HiCheck /> Valider
          </Button>
        </Actions>
      </Details>
    </Card>
  );
}

export default ShopValidatorCard;
