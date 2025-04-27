import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { MapPin, AlertTriangle, CheckCircle, ArrowRight, Clock } from 'lucide-react';

const MyReportsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, we'd fetch the user's reports from Supabase
        if (supabase && user) {
          const { data, error: fetchError } = await supabase
            .from('water_issues')
            .select('*')
            .eq('user_id', user.id);
            
          if (fetchError) throw fetchError;
          
          setReports(data || []);
        } else {
          // Mock data for the demo
          setReports([
            {
              id: '1',
              issue_type: 'leak',
              description: 'Water pipe leaking on main street',
              severity: 'medium',
              status: 'inProgress',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              location: [28.6139, 77.2090],
            },
            {
              id: '2',
              issue_type: 'contamination',
              description: 'Water appears discolored and has a strange odor',
              severity: 'high',
              status: 'pending',
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              location: [28.6150, 77.2100],
            },
            {
              id: '3',
              issue_type: 'flood',
              description: 'Street flooded after heavy rain',
              severity: 'critical',
              status: 'resolved',
              created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
              location: [28.6160, 77.2110],
            },
          ]);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load your reports. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReports();
  }, [user]);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-warning-500" />;
      case 'inProgress':
        return <ArrowRight className="h-5 w-5 text-primary-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-error-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-warning-700 bg-warning-50 border-warning-100';
      case 'inProgress':
        return 'text-primary-700 bg-primary-50 border-primary-100';
      case 'resolved':
        return 'text-success-700 bg-success-50 border-success-100';
      case 'urgent':
        return 'text-error-700 bg-error-50 border-error-100';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-100';
    }
  };
  
  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">My Water Issue Reports</h1>
          <p className="mt-2 text-lg text-gray-600">Track the status of your submitted reports</p>
        </div>
        
        {error && (
          <div className="rounded-md bg-error-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-error-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-error-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
        
        {reports.length === 0 ? (
          <Card className="bg-white">
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                <MapPin className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No reports yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't submitted any water issue reports.
              </p>
              <div className="mt-6">
                <Button
                  variant="primary"
                  className="inline-flex items-center"
                  onClick={() => window.location.href = '/report'}
                >
                  Report an Issue
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {reports.map((report: any) => (
              <Card key={report.id} className="bg-white">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-md ${getStatusClass(report.status)}`}>
                        {getStatusIcon(report.status)}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900 capitalize">
                          {t(`report.issueTypes.${report.issue_type}`)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Reported on {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getSeverityBadgeVariant(report.severity)}>
                      {t(`report.severityLevels.${report.severity}`)}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{report.description}</p>
                  
                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span>
                        {report.location[0].toFixed(4)}, {report.location[1].toFixed(4)}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2 mt-2 sm:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/map?issue=${report.id}`}
                      >
                        View on Map
                      </Button>
                      
                      {report.status !== 'resolved' && (
                        <Button
                          variant={report.status === 'urgent' ? 'danger' : 'primary'}
                          size="sm"
                        >
                          {report.status === 'pending' 
                            ? 'Check Status' 
                            : report.status === 'inProgress' 
                            ? 'View Progress' 
                            : 'Contact Authority'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            className="inline-flex items-center"
            onClick={() => window.location.href = '/report'}
          >
            <MapPin className="mr-2 h-5 w-5" />
            Report Another Issue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyReportsPage;