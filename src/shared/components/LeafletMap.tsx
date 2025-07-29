import React from "react";

const LeafletMap = React.memo(function LeafletMap({
  center,
  zoom,
  height,
  width,
  markerLabel,
}: {
  center: [number, number];
  zoom: number;
  height: number;
  width: string | number;
  markerLabel: string;
}) {
  React.useEffect(() => {
    import("leaflet/dist/leaflet.css");
  }, []);

  const [leaflet, setLeaflet] = React.useState<any>(null);
  React.useEffect(() => {
    let mounted = true;
    Promise.all([import("react-leaflet"), import("leaflet")]).then(([rl]) => {
      if (mounted) setLeaflet(rl);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!leaflet) {
    return <div style={{ height, width }}>Loading map...</div>;
  }

  const { MapContainer, TileLayer, Marker, Popup } = leaflet;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width, borderRadius: 8, marginBottom: 8 }}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={center}>
        <Popup>{markerLabel}</Popup>
      </Marker>
    </MapContainer>
  );
});

export default LeafletMap;
