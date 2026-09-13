"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapPin {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

const markerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42"><path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 26 16 26s16-15 16-26C32 7.163 24.837 0 16 0z" fill="#C4622D"/><circle cx="16" cy="16" r="6" fill="#FAF4E9"/></svg>`;

const markerIcon = L.icon({
  iconUrl: `data:image/svg+xml,${encodeURIComponent(markerSvg)}`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -32],
});

export default function LeafletMapInner({
  pins,
  centerLat,
  centerLng,
  zoom = 10,
}: {
  pins: MapPin[];
  centerLat: number;
  centerLng: number;
  zoom?: number;
}) {
  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={zoom}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((pin) => (
        <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={markerIcon}>
          <Popup>{pin.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
