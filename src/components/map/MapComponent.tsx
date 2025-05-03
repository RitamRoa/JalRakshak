import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap, LayersControl } from 'react-leaflet';
import { divIcon, LatLngTuple, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css';
import { useMap as useMapContext } from '../../contexts/MapContext';
import { AlertTriangle, Droplet, Shield, ThumbsUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { renderToString } from 'react-dom/server';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

// Fix Leaflet default icon issue
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Default center coordinates (New Delhi)
const DEFAULT_CENTER: LatLngTuple = [28.6139, 77.2090];
const DEFAULT_ZOOM = 13;

// Map Controller Component
const MapController = ({ center, zoom }: { center: LatLngTuple; zoom: number }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    try {
      map.setView(center, zoom, { animate: false });
    } catch (err) {
      console.error('Error setting map view:', err);
    }
  }, [map, center, zoom]);

  return null;
};

// Error Boundary Component
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-gray-50">
          <div className="text-red-500">
            Something went wrong with the map. Please refresh the page.
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const createIcon = (icon: React.ReactNode, color: string) => {
  try {
    return divIcon({
      html: renderToString(
        <div className={`bg-${color} p-2 rounded-full text-white shadow-md`}>
          {icon}
        </div>
      ),
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  } catch (err) {
    console.error('Error creating icon:', err);
    return DefaultIcon;
  }
};

// Add custom user location icon with improved water droplet styling
const userLocationIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTEyIDNDMTQuNzYxNyA2LjY2NjY3IDE4IDEwLjQ5MTUgMTggMTRDMTggMTcuMzEzNyAxNS4zMTM3IDIwIDEyIDIwQzguNjg2MjkgMjAgNiAxNy4zMTM3IDYgMTRDNiAxMC40OTE1IDkuMjM4MzMgNi42NjY2NyAxMiAzWiIgZmlsbD0iIzAwN0FGRiIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xMiA3QzEzLjUgOSAxNSAxMC41IDE1IDEyLjVDMTUgMTQuNDMzIDEzLjY1NyAxNiAxMiAxNkMxMC4zNDMgMTYgOSAxNC40MzMgOSAxMi41QzkgMTAuNSAxMC41IDkgMTIgN1oiIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  className: 'drop-shadow-lg'
});

// Add UserLocationMarker component with popup
const UserLocationMarker: React.FC<{ position: LatLngTuple | null }> = ({ position }) => {
  return position === null ? null : (
    <Marker position={position} icon={userLocationIcon}>
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold">Your Location</h3>
          <p className="text-sm text-gray-600">
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
};

const MapComponent: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const {
    waterIssues,
    authorities,
    reservoirs,
    weather,
    visibleLayers,
    setSelectedIssue,
    toggleUpvote,
    center,
    zoom,
    isLoading,
    error,
    setCenter
  } = useMapContext();

  const [isMapReady, setIsMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);

  // Validate coordinates
  const validateCoordinates = (coords: any): coords is LatLngTuple => {
    return Array.isArray(coords) &&
           coords.length === 2 &&
           Number.isFinite(coords[0]) &&
           Number.isFinite(coords[1]) &&
           coords[0] >= -90 && coords[0] <= 90 &&
           coords[1] >= -180 && coords[1] <= 180;
  };

  // Get safe coordinates
  const getSafeCoordinates = (): LatLngTuple => {
    try {
      return validateCoordinates(center) ? center : DEFAULT_CENTER;
    } catch {
      return DEFAULT_CENTER;
    }
  };

  // Get safe zoom level
  const getSafeZoom = (): number => {
    try {
      return Number.isFinite(zoom) && zoom >= 0 && zoom <= 20 ? zoom : DEFAULT_ZOOM;
    } catch {
      return DEFAULT_ZOOM;
    }
  };

  // Get user's location and update map center
  useEffect(() => {
    if (navigator.geolocation) {
      const getPosition = () => new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      Promise.race([
        getPosition(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Geolocation timeout')), 5000))
      ])
        .then((result) => {
          const position = result as GeolocationPosition;
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const userPos: LatLngTuple = [lat, lng];
          setUserLocation(userPos);
          // Update map center to user's location
          setCenter(userPos);
        })
        .catch((geoError) => {
          console.warn('Geolocation error:', geoError);
        });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !isMapReady) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">{t('map.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const safeCenter = getSafeCoordinates();
  const safeZoom = getSafeZoom();

  return (
    <MapErrorBoundary>
      <div className="h-full w-full relative">
        <MapContainer
          center={safeCenter}
          zoom={safeZoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
          className="z-0"
        >
          <MapController center={safeCenter} zoom={safeZoom} />
          
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <UserLocationMarker position={userLocation} />

          <LayersControl position="topright">
            <LayersControl.Overlay checked={visibleLayers.issues} name={t('map.layers.issues')}>
              <div>
                {waterIssues.map(issue => (
                  <Marker
                    key={issue.id}
                    position={validateCoordinates(issue.location) ? issue.location : safeCenter}
                    icon={createIcon(<Droplet size={16} />, 'primary-600')}
                    eventHandlers={{
                      click: () => setSelectedIssue(issue)
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <h3 className="font-semibold">{issue.description}</h3>
                        <p className="text-sm mt-1">Status: {issue.status}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center text-sm text-gray-600">
                            <ThumbsUp size={14} className="mr-1" />
                            <span>{issue.upvote_count || 0}</span>
                          </div>
                          {isAuthenticated && (
                            <Button
                              size="sm"
                              variant={issue.has_upvoted ? "secondary" : "primary"}
                              onClick={() => {
                                toggleUpvote(issue.id);
                              }}
                              className="ml-2"
                            >
                              {issue.has_upvoted ? 'Upvoted' : 'Upvote'}
                            </Button>
                          )}
                        </div>
                        {!isAuthenticated && (
                          <p className="text-xs text-gray-500 mt-2">
                            Sign in to upvote this issue
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </div>
            </LayersControl.Overlay>

            <LayersControl.Overlay checked={visibleLayers.authorities} name={t('map.layers.authorities')}>
              <div>
                {authorities.map(authority => (
                  <Marker
                    key={authority.id}
                    position={validateCoordinates(authority.location) ? authority.location : safeCenter}
                    icon={createIcon(<Shield size={16} />, 'secondary-600')}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">{authority.name}</h3>
                        <p className="text-sm">{authority.phone}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </div>
            </LayersControl.Overlay>

            <LayersControl.Overlay checked={visibleLayers.reservoirs} name={t('map.layers.reservoirs')}>
              <div>
                {reservoirs.map(reservoir => (
                  <CircleMarker
                    key={reservoir.id}
                    center={validateCoordinates(reservoir.location) ? reservoir.location : safeCenter}
                    radius={10}
                    pathOptions={{
                      fillColor: '#3b82f6',
                      fillOpacity: 0.6,
                      color: '#1e40af',
                      weight: 1
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">{reservoir.name}</h3>
                        <p className="text-sm">
                          Level: {Math.round((reservoir.currentLevel / reservoir.capacity) * 100)}%
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </div>
            </LayersControl.Overlay>

            {weather && (
              <LayersControl.Overlay checked={visibleLayers.weather} name={t('map.layers.weather')}>
                <div>
                  <CircleMarker
                    center={validateCoordinates(weather.location) ? weather.location : safeCenter}
                    radius={20}
                    pathOptions={{
                      fillColor: '#93c5fd',
                      fillOpacity: 0.2,
                      color: '#3b82f6',
                      weight: 1
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">Weather</h3>
                        <p className="text-sm">{weather.condition}</p>
                        <p className="text-sm">{weather.temperature}°C</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                </div>
              </LayersControl.Overlay>
            )}
          </LayersControl>
        </MapContainer>
      </div>
    </MapErrorBoundary>
  );
};

export default MapComponent;