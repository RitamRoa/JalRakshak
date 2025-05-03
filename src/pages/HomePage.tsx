import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Bell, FileText, Droplet, AlertTriangle, X } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import MapComponent from '../components/map/MapComponent';
import EmergencyNotification from '../components/EmergencyNotification';
import { supabase } from '../utils/supabaseClient';
import UpvoteButton from '../components/UpvoteButton';

interface EmergencyNotificationData {
  id: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  created_at: string;
}

interface WaterIssue {
  id: string;
  description: string;
  location: [number, number];
  status: string;
  severity: string;
  issueType: string;
  createdAt: string;
  upvote_count: number;
}

const HomePage = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<EmergencyNotificationData[]>([]);
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(true);
  const [waterIssues, setWaterIssues] = useState<WaterIssue[]>([]);
  
  // Mock data for emergency contacts
  const emergencyContacts = [
    { id: 1, name: t('home.waterSupplyDepartment'), phone: '+91-11-23456789', type: 'government' },
    { id: 2, name: t('home.plumbingServices'), phone: '+91-11-98765432', type: 'service' },
    { id: 3, name: t('home.floodControl'), phone: '+91-11-45678901', type: 'emergency' },
  ];
  
  // Mock data for government schemes
  const govtSchemes = [
    { 
      id: 1, 
      title: t('home.schemes.jalJeevanMission.title'), 
      description: t('home.schemes.jalJeevanMission.description'),
      url: '#'
    },
    { 
      id: 2, 
      title: t('home.schemes.atalBhujalYojana.title'), 
      description: t('home.schemes.atalBhujalYojana.description'),
      url: '#'
    },
  ];
  
  // Mock data for notices
  const notices = [
    { 
      id: 1, 
      title: 'Planned Water Supply Shutdown', 
      description: 'Water supply will be temporarily suspended on May 15th from 10:00 AM to 4:00 PM for maintenance work.',
      date: '2025-05-10',
      priority: 'high'
    },
    { 
      id: 2, 
      title: 'Water Conservation Advisory', 
      description: 'Due to expected drought conditions, all citizens are advised to minimize water usage for the next month.',
      date: '2025-05-08',
      priority: 'medium'
    },
    { 
      id: 3, 
      title: 'New Report Feature Available', 
      description: 'Our platform now allows you to upload photos with your water issue reports for better documentation.',
      date: '2025-05-05',
      priority: 'low'
    },
  ];
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // First, check if the table exists
        const { error: tableError } = await supabase
          .from('emergency_notifications')
          .select('count', { count: 'exact', head: true });

        if (tableError) {
          console.error('Error checking table:', tableError);
          // Create the table if it doesn't exist
          await supabase.rpc('create_emergency_notifications_table');
        }

        // Fetch notifications
        const { data, error } = await supabase
          .from('emergency_notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }

        console.log('Fetched notifications:', data);
        if (data && data.length > 0) {
          setNotifications(data);
          setShowEmergencyBanner(true);
        }
      } catch (err) {
        console.error('Error in fetchNotifications:', err);
      }
    };

    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase.channel('emergency_notifications_changes');
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_notifications'
        },
        (payload) => {
          console.log('Received real-time update:', payload);
          fetchNotifications();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchWaterIssues = async () => {
      try {
        const { data, error } = await supabase
          .from('water_issues')
          .select('*')
          .order('upvote_count', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching water issues:', error);
          return;
        }

        setWaterIssues(data || []);
      } catch (err) {
        console.error('Error in fetchWaterIssues:', err);
      }
    };

    fetchWaterIssues();

    // Subscribe to changes in water_issues table
    const channel = supabase.channel('water_issues_changes');
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'water_issues'
        },
        () => {
          fetchWaterIssues();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Get high severity notification if exists
  const highSeverityNotification = notifications.find(n => n.severity === 'high');

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      {/* Emergency Alert Marquee */}
      {highSeverityNotification && showEmergencyBanner && (
        <div className="bg-red-700 text-white overflow-hidden border-b-2 border-red-800 relative">
          <div className="flex items-center py-3">
            <div className="animate-marquee whitespace-nowrap flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-100 ml-4" />
              <span className="text-lg font-bold mx-3 uppercase">{t('common.emergencyAlert')}:</span>
              <span className="text-lg">{highSeverityNotification.message}</span>
              <span className="mx-8">•</span>
              <AlertTriangle className="h-6 w-6 text-red-100 ml-4" />
              <span className="text-lg font-bold mx-3 uppercase">{t('common.emergencyAlert')}:</span>
              <span className="text-lg">{highSeverityNotification.message}</span>
              <span className="mx-8">•</span>
            </div>
            <div className="absolute animate-marquee2 whitespace-nowrap flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-100 ml-4" />
              <span className="text-lg font-bold mx-3 uppercase">{t('common.emergencyAlert')}:</span>
              <span className="text-lg">{highSeverityNotification.message}</span>
              <span className="mx-8">•</span>
              <AlertTriangle className="h-6 w-6 text-red-100 ml-4" />
              <span className="text-lg font-bold mx-3 uppercase">{t('common.emergencyAlert')}:</span>
              <span className="text-lg">{highSeverityNotification.message}</span>
              <span className="mx-8">•</span>
            </div>
          </div>
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-md p-1.5 text-red-100 hover:text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-700 focus:ring-red-500 transition-colors duration-200"
            onClick={() => setShowEmergencyBanner(false)}
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Regular Emergency Notifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <EmergencyNotification 
          notifications={notifications.filter(n => n.severity !== 'high')}
          onDismiss={(id) => {
            setNotifications(prev => prev.filter(n => n.id !== id));
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 text-white py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight">
                {t('home.title')}
              </h1>
              <p className="text-lg md:text-xl opacity-90">
                {t('home.subtitle')}
              </p>
              <div className="pt-4">
                <Link to="/report">
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    icon={<FileText />}
                  >
                    {t('home.reportButton')}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-2xl animate-slide-up">
              <div className="aspect-w-16 aspect-h-9 lg:aspect-h-9 h-[300px] md:h-[400px]">
                <MapComponent />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Notices */}
          <div className="lg:col-span-2 space-y-8">
            <Card 
              title={t('home.recentIssues')}
              headerAction={
                <Link to="/report" className="text-primary-600 hover:text-primary-700">
                  <Button variant="outline" size="sm">
                    {t('home.reportIssue')}
                  </Button>
                </Link>
              }
              className="animate-fade-in"
            >
              <div className="space-y-4">
                {waterIssues.slice(0, 5).map(issue => (
                  <div 
                    key={issue.id}
                    className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {t(`report.issueTypes.${issue.issueType}`)}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">{issue.description}</p>
                        <div className="mt-2 flex items-center space-x-4">
                          <Badge 
                            variant={
                              issue.status === 'urgent' ? 'error' : 
                              issue.status === 'inProgress' ? 'primary' : 
                              issue.status === 'resolved' ? 'success' : 'warning'
                            }
                            size="sm"
                          >
                            {t(`admin.statuses.${issue.status}`)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                          <UpvoteButton 
                            issueId={issue.id} 
                            initialUpvotes={issue.upvote_count || 0}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card 
              title={t('home.notices')}
              headerAction={
                <Bell className="text-primary-600" />
              }
              className="animate-fade-in"
            >
              <div className="space-y-4">
                {notices.map(notice => (
                  <div 
                    key={notice.id}
                    className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">{notice.title}</h3>
                      <Badge 
                        variant={
                          notice.priority === 'high' ? 'error' : 
                          notice.priority === 'medium' ? 'warning' : 'info'
                        }
                        size="sm"
                      >
                        {notice.priority}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{notice.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {t('home.postedLabel')} {new Date(notice.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card 
              title={t('home.govtSchemes')}
              className="animate-fade-in"
            >
              <div className="space-y-4">
                {govtSchemes.map(scheme => (
                  <div 
                    key={scheme.id}
                    className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0"
                  >
                    <h3 className="font-medium text-gray-900">{scheme.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{scheme.description}</p>
                    <div className="mt-2">
                      <a 
                        href={scheme.url}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {t('common.learnMore')}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
          {/* Right Column: Stats & Emergency Contacts */}
          <div className="space-y-8">
            <Card 
              title={t('home.waterWatchStats')} 
              className="bg-white animate-fade-in"
            >
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <Droplet className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">{t('home.activeIssues')}</h4>
                    <p className="text-2xl font-semibold text-gray-900">43</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-success-100 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-success-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">{t('home.issuesResolved')}</h4>
                    <p className="text-2xl font-semibold text-gray-900">217</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-warning-100 p-3 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-warning-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">{t('home.urgentIssues')}</h4>
                    <p className="text-2xl font-semibold text-gray-900">8</p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card 
              title={t('home.emergencyContacts')}
              className="animate-fade-in"
            >
              <div className="space-y-4">
                {emergencyContacts.map(contact => (
                  <div 
                    key={contact.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-primary-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{contact.name}</h4>
                        <p className="text-sm text-gray-500">
                          {t(`home.organizationType.${contact.type}`)}
                        </p>
                      </div>
                    </div>
                    <a 
                      href={`tel:${contact.phone}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {contact.phone}
                    </a>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-secondary-600 to-secondary-800 text-white animate-fade-in">
              <div className="text-center py-4">
                <h3 className="text-xl font-semibold mb-2">{t('actionPlan.waterSafetyScore')}</h3>
                <div className="inline-flex items-center justify-center rounded-full bg-white h-24 w-24 mb-4">
                  <span className="text-3xl font-bold text-secondary-600">87</span>
                </div>
                <p className="opacity-90 mb-4">{t('actionPlan.goodManagement')}</p>
                <Link to="/action-plan">
                  <Button 
                    variant="primary" 
                    className="bg-white text-secondary-800 hover:bg-gray-100"
                  >
                    {t('actionPlan.viewPlan')}
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;