// Hardcoded rather than CSS variables: Leaflet writes these as SVG
// attributes, and the OSM tiles stay light even in dark mode.
export const EXISTING_SHOP_STYLES = {
  validated: { color: "#15803d", fillColor: "#22c55e" },
  pending: { color: "#ca7904", fillColor: "#fcc704" },
};
