import { useEffect } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import type { RouteGeometry, Waypoint } from '@/types';
import 'leaflet/dist/leaflet.css';

interface DealRouteMapProps {
  waypoints?: Waypoint[] | null;
  geometry?: RouteGeometry | null;
  editable?: boolean;
  onMapClick?: (point: { lat: number; lng: number }) => void;
  className?: string;
}

type LatLngTuple = [number, number];

export function isValidWaypoint(point: Waypoint | null | undefined): point is Waypoint {
  return Boolean(
    point &&
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng) &&
      point.lat >= -90 &&
      point.lat <= 90 &&
      point.lng >= -180 &&
      point.lng <= 180,
  );
}

function filterValidWaypoints(waypoints?: Waypoint[] | null): Waypoint[] {
  return (waypoints || []).filter(isValidWaypoint);
}

function validGeometry(geometry?: RouteGeometry | null): LatLngTuple[] {
  if (!geometry || geometry.type !== 'LineString' || !Array.isArray(geometry.coordinates)) return [];
  return geometry.coordinates
    .filter((coordinate) => Array.isArray(coordinate) && coordinate.length >= 2)
    .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat))
    .map(([lng, lat]) => [lat, lng] as LatLngTuple);
}

function numberedIcon(number: number) {
  return L.divIcon({
    className: 'deal-route-marker',
    html: `<span>${number}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
}

function MapBounds({ waypoints, geometry }: { waypoints: Waypoint[]; geometry?: RouteGeometry | null }) {
  const map = useMap();
  const geometryPoints = validGeometry(geometry);

  useEffect(() => {
    const points = [
      ...filterValidWaypoints(waypoints).map((point) => [point.lat, point.lng] as LatLngTuple),
      ...geometryPoints,
    ];
    const resizeAndFit = () => {
      map.invalidateSize();
      if (points.length === 1) map.setView(points[0], 11);
      if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [28, 28] });
    };
    const frame = requestAnimationFrame(resizeAndFit);
    return () => cancelAnimationFrame(frame);
  }, [geometry, geometryPoints.length, map, waypoints]);

  return null;
}

function ClickHandler({ onMapClick }: { onMapClick?: DealRouteMapProps['onMapClick'] }) {
  useMapEvents({
    click: (event) => onMapClick?.({ lat: event.latlng.lat, lng: event.latlng.lng }),
  });
  return null;
}

const defaultCenter: LatLngTuple = [23.8103, 90.4125];

export function DealRouteMap({
  waypoints = [],
  geometry,
  editable = false,
  onMapClick,
  className = '',
}: DealRouteMapProps) {
  const safeWaypoints = filterValidWaypoints(waypoints);
  const line = validGeometry(geometry);
  const firstPoint = safeWaypoints[0];
  const center: LatLngTuple = firstPoint ? [firstPoint.lat, firstPoint.lng] : defaultCenter;

  return (
    <div
      className={`relative overflow-hidden rounded-lg border ${className}`}
      role="region"
      aria-label={editable ? 'Editable tour route map' : 'Tour route map'}
    >
      <MapContainer
        center={center}
        zoom={firstPoint ? 10 : 7}
        scrollWheelZoom
        className="h-full w-full"
        aria-label={editable ? 'Editable tour route map' : 'Tour route map'}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds waypoints={safeWaypoints} geometry={geometry} />
        {editable && <ClickHandler onMapClick={onMapClick} />}
        {safeWaypoints.map((point, index) => (
          <Marker key={`${point.lat}-${point.lng}-${index}`} position={[point.lat, point.lng]} icon={numberedIcon(index + 1)}>
            <Popup>{point.name || `Stop ${index + 1}`}</Popup>
          </Marker>
        ))}
        {safeWaypoints.length > 1 && line.length > 1 && <Polyline positions={line} pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.85 }} />}
      </MapContainer>
      {editable && (
        <div className="pointer-events-none absolute bottom-2 left-2 z-[1000] rounded bg-white/90 px-2 py-1 text-xs text-slate-600 shadow">
          Click the map to add a stop. On touch devices, use the ordered list below to edit the route.
        </div>
      )}
    </div>
  );
}
