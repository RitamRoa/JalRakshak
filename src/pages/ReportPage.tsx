import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLngTuple, Icon } from 'leaflet';
import { useAuth } from '../contexts/AuthContext';
import { supabase, checkSupabaseConnection } from '../utils/supabaseClient';
import 'leaflet/dist/leaflet.css';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { AlertTriangle, Check, MapPin, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

// Default map center (New Delhi)
const DEFAULT_CENTER: LatLngTuple = [28.6139, 77.2090];

// Create custom icons with improved water droplet styling
const userLocationIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTEyIDNDMTQuNzYxNyA2LjY2NjY3IDE4IDEwLjQ5MTUgMTggMTRDMTggMTcuMzEzNyAxNS4zMTM3IDIwIDEyIDIwQzguNjg2MjkgMjAgNiAxNy4zMTM3IDYgMTRDNiAxMC40OTE1IDkuMjM4MzMgNi42NjY2NyAxMiAzWiIgZmlsbD0iIzAwN0FGRiIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xMiA3QzEzLjUgOSAxNSAxMC41IDE1IDEyLjVDMTUgMTQuNDMzIDEzLjY1NyAxNiAxMiAxNkMxMC4zNDMgMTYgOSAxNC40MzMgOSAxMi41QzkgMTAuNSAxMC41IDkgMTIgN1oiIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  className: 'drop-shadow-lg'
});

const issueLocationIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTEyIDNDMTQuNzYxNyA2LjY2NjY3IDE4IDEwLjQ5MTUgMTggMTRDMTggMTcuMzEzNyAxNS4zMTM3IDIwIDEyIDIwQzguNjg2MjkgMjAgNiAxNy4zMTM3IDYgMTRDNiAxMC40OTE1IDkuMjM4MzMgNi42NjY2NyAxMiAzWiIgZmlsbD0iI0ZGNDQzRSIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xMiA3QzEzLjUgOSAxNSAxMC41IDE1IDEyLjVDMTUgMTQuNDMzIDEzLjY1NyAxNiAxMiAxNkMxMC4zNDMgMTYgOSAxNC40MzMgOSAxMi41QzkgMTAuNSAxMC41IDkgMTIgN1oiIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  className: 'drop-shadow-lg'
});

interface LocationMarkerProps {
  position: LatLngTuple | null;
  setPosition: (position: LatLngTuple) => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={issueLocationIcon} />
  );
};

const UserLocationMarker: React.FC<{ position: LatLngTuple | null }> = ({ position }) => {
  return position === null ? null : (
    <Marker position={position} icon={userLocationIcon} />
  );
};

const ReportPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [position, setPosition] = useState<LatLngTuple | null>(null);
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngTuple | null>(null);
  const [issueType, setIssueType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<string>('medium');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize map with user's location
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
          setMapCenter(userPos);
          setPosition(userPos);
        })
        .catch((geoError) => {
          console.warn('Geolocation error:', geoError);
          // Don't set any center if geolocation fails
          setError('Could not get your location. Please enable location services and try again.');
        });
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!position) {
        setError('Please select a location on the map');
        return;
      }
      
      if (!issueType) {
        setError('Please select an issue type');
        return;
      }
      
      if (!description) {
        setError('Please provide a description of the issue');
        return;
      }
      
      setIsSubmitting(true);
      setError(null);
      
      // Create the report object
      const reportData = {
        issue_type: issueType.toLowerCase(),
        description,
        severity,
        location: `(${position[1]},${position[0]})`,
        user_id: user?.id || '00000000-0000-0000-0000-000000000000'
      };
      
      // Insert the data
      const { data, error: submitError } = await supabase
        .from('water_issues')
        .insert([reportData])
        .select()
        .single();
      
      if (submitError) {
        console.error('Submission error:', submitError);
        throw new Error(submitError.message);
      }
      
      console.log('Successfully submitted report:', data);
      
      // Show success message
      setIsSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setPosition(null);
        setIssueType('');
        setDescription('');
        setSeverity('medium');
        setIsSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('report.title')}</h1>
        
      {isSuccess ? (
        <Card className="animate-fade-in bg-white">
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100">
              <Check className="h-6 w-6 text-success-600" />
            </div>
            <h2 className="mt-3 text-lg font-medium text-gray-900">Report Submitted Successfully!</h2>
            <p className="mt-2 text-sm text-gray-500">
              Thank you for contributing to your community's water management.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <Link to="/">
                <Button variant="outline">Return to Home</Button>
              </Link>
              <Link to="/map">
                <Button>View on Map</Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="mb-6 bg-white">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('report.locationLabel')}</label>
              {mapCenter ? (
                <div className="h-[300px] rounded-lg overflow-hidden border border-gray-300">
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <UserLocationMarker position={userLocation} />
                    <LocationMarker position={position} setPosition={setPosition} />
                  </MapContainer>
                </div>
              ) : (
                <div className="h-[300px] rounded-lg overflow-hidden border border-gray-300 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="text-gray-500 mb-2">Loading map...</div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                  </div>
                </div>
              )}
              <p className="mt-2 text-sm text-gray-500 flex items-center">
                <MapPin size={16} className="mr-1" />
                {t('report.clickMapText')}
              </p>
              {position && (
                <div className="mt-2 text-xs text-gray-500">
                  {t('report.coordinatesLabel')} {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('report.issueTypeLabel')}</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                aria-label={t('report.selectIssueType')}
              >
                <option value="">{t('report.selectIssueType')}</option>
                {Object.keys(t('report.issueTypes', { returnObjects: true })).map((type) => (
                  <option key={type} value={type}>
                    {t(`report.issueTypes.${type}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                {t('report.severityLabel')}
              </label>
              <div className="flex space-x-4">
                {['low', 'medium', 'high', 'critical'].map((level) => (
                  <label
                    key={level}
                    className={`flex-1 flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer text-sm font-medium transition-colors
                      ${
                        severity === level
                          ? level === 'low'
                            ? 'bg-success-100 border-success-500 text-success-700'
                            : level === 'medium'
                            ? 'bg-warning-100 border-warning-500 text-warning-700'
                            : 'bg-error-100 border-error-500 text-error-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={level}
                      checked={severity === level}
                      onChange={() => setSeverity(level)}
                      className="sr-only"
                    />
                    {t(`report.severityLevels.${level}`)}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                {t('report.descriptionLabel')}
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('report.descriptionPlaceholder')}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 text-error-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-error-700">{error}</span>
              </div>
            )}

            {!isAuthenticated && (
              <div className="mb-4 p-3 bg-warning-50 border border-warning-200 rounded-md">
                <p className="text-sm text-warning-700">
                  You are not signed in. Your report will be submitted anonymously.{' '}
                  <Link to="/admin/login" className="font-medium text-primary-600 hover:text-primary-500">
                    Sign in
                  </Link>{' '}
                  to track your reports.
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? t('common.loading') : t('report.submitButton')}
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
};

export default ReportPage;