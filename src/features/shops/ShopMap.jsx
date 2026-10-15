import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  CircleMarker,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import styled from "styled-components";

import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { useShopsInArea } from "./useShopsInArea";

// Hardcoded rather than CSS variables: Leaflet writes these as SVG
// attributes, and the OSM tiles stay light even in dark mode.
const EXISTING_SHOP_STYLES = {
  validated: { color: "#15803d", fillColor: "#22c55e" },
  pending: { color: "#ca7904", fillColor: "#fcc704" },
};

const markerDefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapWrapper = styled.div`
  .leaflet-container {
    width: 100%;
    height: 32rem;
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 1.6rem;
  margin-top: 0.8rem;
  font-size: 1.2rem;
  color: var(--color-grey-500);
`;

const LegendItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.6rem;

  &::before {
    content: "";
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 2px solid ${(props) => props.$style.color};
    background-color: ${(props) => props.$style.fillColor};
  }
`;

function toBounds(map) {
  const bounds = map.getBounds();
  return {
    minLat: bounds.getSouth(),
    maxLat: bounds.getNorth(),
    minLng: bounds.getWest(),
    maxLng: bounds.getEast(),
  };
}

// Reports the visible area on mount and after every pan/zoom.
function BoundsWatcher({ onBoundsChange }) {
  const map = useMap();

  useEffect(() => {
    onBoundsChange(toBounds(map));
  }, [map, onBoundsChange]);

  useMapEvents({ moveend: () => onBoundsChange(toBounds(map)) });

  return null;
}

// Shops already in the API around the one being validated, so duplicates
// are easy to spot. The shop being validated is excluded.
function ExistingShops({ excludeId }) {
  const [bounds, setBounds] = useState(null);
  const { shops } = useShopsInArea(bounds);

  return (
    <>
      <BoundsWatcher onBoundsChange={setBounds} />
      {shops
        .filter((shop) => shop.id !== excludeId)
        .map((shop) => (
          <CircleMarker
            key={shop.id}
            center={[shop.latitude, shop.longitude]}
            radius={7}
            pathOptions={{
              ...EXISTING_SHOP_STYLES[shop.validated ? "validated" : "pending"],
              weight: 2,
              fillOpacity: 0.8,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <strong>{shop.name}</strong>
              {shop.address && <div>{shop.address}</div>}
              <div>{shop.validated ? "Validé" : "En attente de validation"}</div>
            </Tooltip>
          </CircleMarker>
        ))}
    </>
  );
}

// Draggable marker: the pin's position can be corrected by moving it,
// the new coordinates are reported back through onPositionChange.
function ShopMap({ shopId, position, onPositionChange }) {
  const markerRef = useRef(null);
  const center = useMemo(() => [position.lat, position.lng], [position.lat, position.lng]);

  const handleDragEnd = useCallback(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const { lat, lng } = marker.getLatLng();
    onPositionChange({ lat, lng });
  }, [onPositionChange]);

  return (
    <MapWrapper>
      <MapContainer center={center} zoom={17} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ExistingShops excludeId={shopId} />
        <Marker
          position={center}
          icon={markerDefaultIcon}
          draggable
          eventHandlers={{ dragend: handleDragEnd }}
          ref={markerRef}
        />
      </MapContainer>
      <Legend>
        <LegendItem $style={EXISTING_SHOP_STYLES.validated}>
          Lieu validé
        </LegendItem>
        <LegendItem $style={EXISTING_SHOP_STYLES.pending}>
          Lieu en attente
        </LegendItem>
      </Legend>
    </MapWrapper>
  );
}

export default ShopMap;
