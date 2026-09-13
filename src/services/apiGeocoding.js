// Reverse geocoding via the public Nominatim API (OpenStreetMap), called
// directly from the browser — same approach as the mobile app
// (flutter_app/lib/widgets/map/create_shop_sheet.dart). No API key needed,
// Nominatim's usage policy allows direct browser calls at this volume.
export async function reverseGeocode(lat, lon) {
  try {
    const params = new URLSearchParams({
      lat,
      lon,
      format: "json",
      "accept-language": "fr",
    });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
    );
    if (!res.ok) {
      throw new Error(`Response status: ${res.status}`);
    }
    const data = await res.json();
    const addr = data.address || {};

    const road = addr.road || addr.pedestrian || addr.path || "";
    const houseNumber = addr.house_number || "";
    const address = houseNumber ? `${houseNumber} ${road}` : road;
    const city =
      addr.city || addr.town || addr.village || addr.municipality || "";
    const country = addr.country || "";

    return { address: address.trim(), city, country };
  } catch (error) {
    throw new Error(`Couldn't reverse geocode this position. ${error.message}`);
  }
}
