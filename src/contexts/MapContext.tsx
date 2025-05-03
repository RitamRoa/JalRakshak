import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LatLngTuple } from 'leaflet';
import { supabase, checkSupabaseConnection } from '../utils/supabaseClient';
import { weatherApi } from '../utils/apiClients';
import { useAuth } from './AuthContext';

// Strict type definitions
export interface WaterIssue {
  id: string;
  location: LatLngTuple;
  issueType: 'leak' | 'flood' | 'contamination' | 'shortage' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'inProgress' | 'resolved' | 'urgent';
  createdAt: string;
  updatedAt: string;
  userId: string;
  upvote_count: number;
  has_upvoted?: boolean;
}

interface Authority {
  id: string;
  name: string;
  location: LatLngTuple;
  type: string;
  phone: string;
}

interface Reservoir {
  id: string;
  name: string;
  location: LatLngTuple;
  capacity: number;
  currentLevel: number;
}

interface WeatherData {
  location: LatLngTuple;
  temperature: number;
  condition: string;
  humidity: number;
  rainfall: number;
  alerts: string[];
  updatedAt: string;
}

interface MapContextProps {
  waterIssues: WaterIssue[];
  authorities: Authority[];
  reservoirs: Reservoir[];
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  fetchMapData: () => Promise<void>;
  toggleLayer: (layer: string, visible: boolean) => void;
  visibleLayers: Record<string, boolean>;
  selectedIssue: WaterIssue | null;
  setSelectedIssue: (issue: WaterIssue | null) => void;
  center: LatLngTuple;
  setCenter: (center: LatLngTuple) => boolean;
  zoom: number;
  setZoom: (zoom: number) => void;
  toggleUpvote: (issueId: string) => Promise<void>;
}

const DEFAULT_CENTER: LatLngTuple = [28.6139, 77.2090];
const DEFAULT_ZOOM = 10;

const MapContext = createContext<MapContextProps | undefined>(undefined);

export const useMap = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};

interface MapProviderProps {
  children: React.ReactNode;
}

export const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [waterIssues, setWaterIssues] = useState<WaterIssue[]>([]);
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [reservoirs, setReservoirs] = useState<Reservoir[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleLayers, setVisibleLayers] = useState({
    issues: true,
    authorities: true,
    reservoirs: true,
    weather: false,
  });
  const [selectedIssue, setSelectedIssue] = useState<WaterIssue | null>(null);
  const [center, setCenter] = useState<LatLngTuple>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  // Validate coordinates
  const validateCoordinates = useCallback((coords: any): coords is LatLngTuple => {
    if (!Array.isArray(coords) || coords.length !== 2) return false;
    
    const [lat, lng] = coords;
    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180
    );
  }, []);

  // Safe setter for center coordinates
  const setCenterSafe = useCallback((newCenter: LatLngTuple): boolean => {
    try {
      if (!validateCoordinates(newCenter)) {
        console.error('Invalid coordinates:', newCenter);
        return false;
      }

      const [lat, lng] = newCenter;
      setCenter([
        Number(lat.toFixed(6)),
        Number(lng.toFixed(6))
      ]);
      return true;
    } catch (err) {
      console.error('Error setting center:', err);
      return false;
    }
  }, [validateCoordinates]);

  // Safe setter for zoom
  const setZoomSafe = useCallback((newZoom: number) => {
    if (!Number.isFinite(newZoom) || newZoom < 0 || newZoom > 20) {
      console.error('Invalid zoom level:', newZoom);
      setZoom(DEFAULT_ZOOM);
      return;
    }
    setZoom(Math.round(newZoom));
  }, []);

  const fetchMapData = useCallback(async () => {
    if (!validateCoordinates(center)) {
      console.error('Invalid coordinates for fetching data:', center);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First check if we can connect to Supabase
      const { isConfigured, error: connectionError } = await checkSupabaseConnection();
      
      if (!isConfigured) {
        console.error('Supabase connection failed:', connectionError);
        setError('Unable to connect to the database. Please try again later.');
        return;
      }

      // Fetch water issues from Supabase
      const { data: issuesData, error: issuesError } = await supabase
        .from('water_issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (issuesError) {
        console.error('Error fetching water issues:', issuesError);
        setError('Unable to fetch water issues. Please try again later.');
        return;
      }

      // Handle empty data case
      if (!issuesData || issuesData.length === 0) {
        console.log('No water issues found');
        setWaterIssues([]);
      } else {
        // Transform the data to ensure proper location format
        const transformedIssues = issuesData.map(issue => {
          let location: LatLngTuple;
          try {
            if (typeof issue.location === 'string') {
              const [lng, lat] = issue.location
                .slice(1, -1)
                .split(',')
                .map(Number);
              location = [lat, lng];
            } else if (Array.isArray(issue.location)) {
              location = [issue.location[1], issue.location[0]];
            } else {
              console.warn('Invalid location format for issue:', issue.id);
              location = [center[0], center[1]];
            }

            if (!validateCoordinates(location)) {
              console.warn('Invalid coordinates after transformation:', location);
              location = [center[0], center[1]];
            }
          } catch (err) {
            console.error('Error parsing location for issue:', issue.id, err);
            location = [center[0], center[1]];
          }

          return {
            ...issue,
            location,
            has_upvoted: false,
            issueType: (issue.issue_type || issue.issueType || 'other').toLowerCase() as WaterIssue['issueType']
          };
        });

        // If user is authenticated, fetch their upvotes
        if (user) {
          try {
            const { data: upvotes, error: upvotesError } = await supabase
              .from('issue_upvotes')
              .select('issue_id')
              .eq('user_id', user.id);

            if (!upvotesError && upvotes) {
              const userUpvotes = new Set(upvotes.map(u => u.issue_id));
              transformedIssues.forEach(issue => {
                issue.has_upvoted = userUpvotes.has(issue.id);
              });
            }
          } catch (upvoteErr) {
            console.error('Error fetching upvotes:', upvoteErr);
          }
        }

        setWaterIssues(transformedIssues);
      }

      // Mock data for other entities
      setAuthorities([{
        id: '1',
        name: 'Water Supply Department',
        location: [center[0] + 0.002, center[1] + 0.002],
        type: 'government',
        phone: '+91-11-12345678',
      }]);
      
      setReservoirs([{
        id: '1',
        name: 'Central Reservoir',
        location: [center[0] + 0.003, center[1] + 0.003],
        capacity: 10000,
        currentLevel: 8500,
      }]);

      setWeather({
        location: center,
        temperature: 25,
        condition: 'Clear',
        humidity: 65,
        rainfall: 0,
        alerts: [],
        updatedAt: new Date().toISOString(),
      });
      
    } catch (err: any) {
      console.error('Error in fetchMapData:', err);
      setError('Unable to load map data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [center, user, validateCoordinates]);

  // Initialize map data and handle geolocation
  useEffect(() => {
    let isMounted = true;
    
    const initializeMap = async () => {
      if (!isMounted) return;
      
      try {
        // Try geolocation first
        if (navigator.geolocation) {
          const getPosition = () => new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            });
          });

          try {
            const position = await Promise.race([
              getPosition(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Geolocation timeout')), 5000))
            ]) as GeolocationPosition;

            if (!isMounted) return;

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            if (!setCenterSafe([lat, lng])) {
              throw new Error('Invalid coordinates from geolocation');
            }
          } catch (geoError) {
            console.warn('Geolocation error:', geoError);
            if (isMounted) {
              setCenterSafe(DEFAULT_CENTER);
            }
          }
        } else {
          if (isMounted) {
            setCenterSafe(DEFAULT_CENTER);
          }
        }
      } catch (err: any) {
        console.error('Error initializing map:', err);
        if (isMounted) {
          setError(err.message);
          setCenterSafe(DEFAULT_CENTER);
        }
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
    };
  }, [setCenterSafe]);

  // Fetch data whenever center changes or user auth state changes
  useEffect(() => {
    fetchMapData();
  }, [fetchMapData, user]);

  const toggleLayer = useCallback((layer: string, visible: boolean) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layer]: visible,
    }));
  }, []);

  // Toggle upvote for an issue
  const toggleUpvote = async (issueId: string) => {
    if (!user) {
      setError('Please sign in to upvote issues');
      return;
    }

    try {
      const issue = waterIssues.find(i => i.id === issueId);
      if (!issue) return;

      if (issue.has_upvoted) {
        // Remove upvote
        const { error } = await supabase
          .from('issue_upvotes')
          .delete()
          .eq('issue_id', issueId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Add upvote
        const { error } = await supabase
          .from('issue_upvotes')
          .insert({
            issue_id: issueId,
            user_id: user.id
          });

        if (error) throw error;
      }

      // Refresh water issues
      await fetchMapData();
    } catch (err) {
      console.error('Error toggling upvote:', err);
      setError('Failed to update upvote');
    }
  };

  const value: MapContextProps = {
    waterIssues,
    authorities,
    reservoirs,
    weather,
    isLoading,
    error,
    fetchMapData,
    toggleLayer,
    visibleLayers,
    selectedIssue,
    setSelectedIssue,
    center,
    setCenter: setCenterSafe,
    zoom,
    setZoom: setZoomSafe,
    toggleUpvote,
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};