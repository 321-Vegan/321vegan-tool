import { CircleMarker, Tooltip } from "react-leaflet";

import { EXISTING_SHOP_STYLES } from "@/features/shops/mapStyles";
import { useNearbyRestaurants } from "./useNearbyRestaurants";

// Radius covering the map at its default zoom
const LAYER_RADIUS_METERS = 300;

// Restaurants already in the API around the one being validated (validated or
// pending), so duplicates are easy to spot. The restaurant itself is excluded.
function NearbyRestaurantsLayer({ restaurant }) {
  const { restaurants } = useNearbyRestaurants(
    restaurant,
    LAYER_RADIUS_METERS,
  );

  return restaurants
    .filter((other) => other.id !== restaurant.id)
    .map((other) => (
      <CircleMarker
        key={other.id}
        center={[other.latitude, other.longitude]}
        radius={7}
        pathOptions={{
          ...EXISTING_SHOP_STYLES[other.validated ? "validated" : "pending"],
          weight: 2,
          fillOpacity: 0.8,
        }}
      >
        <Tooltip direction="top" offset={[0, -6]}>
          <strong>{other.name}</strong>
          <div>{other.validated ? "Validé" : "En attente de validation"}</div>
        </Tooltip>
      </CircleMarker>
    ));
}

export default NearbyRestaurantsLayer;
