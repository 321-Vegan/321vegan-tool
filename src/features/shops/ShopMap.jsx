import { useCallback, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import styled from "styled-components";

import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

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

// Draggable marker: the pin's position can be corrected by moving it,
// the new coordinates are reported back through onPositionChange.
function ShopMap({ position, onPositionChange }) {
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
        <Marker
          position={center}
          icon={markerDefaultIcon}
          draggable
          eventHandlers={{ dragend: handleDragEnd }}
          ref={markerRef}
        />
      </MapContainer>
    </MapWrapper>
  );
}

export default ShopMap;
