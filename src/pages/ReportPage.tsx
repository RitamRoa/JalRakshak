import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import { useAuth } from '../contexts/AuthContext';
import { supabase, checkSupabaseConnection } from '../utils/supabaseClient';
import 'leaflet/dist/leaflet.css';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { AlertTriangle, Check, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <Marker position={position} />
  );
};

const ReportPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [position, setPosition] = useState<LatLngTuple | null>(null);
  const [issueType, setIssueType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<string>('medium');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Default map center (New Delhi)
  const defaultCenter: LatLngTuple = [28.6139, 77.2090];

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
        issue_type: issueType,
        description,
        severity,
        location: `(${position[1]},${position[0]})`,
        user_id: '00000000-0000-0000-0000-000000000000'
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
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">{t('report.title')}</h1>
          <p className="mt-2 text-lg text-gray-600">Help your community by reporting water issues</p>
        </div>
        
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
                <div className="h-[300px] rounded-lg overflow-hidden border border-gray-300">
                  <MapContainer
                    center={defaultCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                  </MapContainer>
                </div>
                <p className="mt-2 text-sm text-gray-500 flex items-center">
                  <MapPin size={16} className="mr-1" />
                  Click on the map to set the exact location of the issue
                </p>
                {position && (
                  <div className="mt-2 text-xs text-gray-500">
                    Selected coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('report.issueTypeLabel')}
                </label>
                <select
                  id="issueType"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="" disabled>Select an issue type</option>
                  <option value="leak">{t('report.issueTypes.leak')}</option>
                  <option value="flood">{t('report.issueTypes.flood')}</option>
                  <option value="contamination">{t('report.issueTypes.contamination')}</option>
                  <option value="shortage">{t('report.issueTypes.shortage')}</option>
                  <option value="other">{t('report.issueTypes.other')}</option>
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
    </div>
  );
};

export default ReportPage;