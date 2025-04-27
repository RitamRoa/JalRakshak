import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Bell, FileText, Droplet, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import MapComponent from '../components/map/MapComponent';

const HomePage = () => {
  const { t } = useTranslation();
  
  // Mock data for emergency contacts
  const emergencyContacts = [
    { id: 1, name: 'Water Supply Department', phone: '+91-11-23456789', type: 'government' },
    { id: 2, name: 'Plumbing Emergency Services', phone: '+91-11-98765432', type: 'service' },
    { id: 3, name: 'Flood Control Room', phone: '+91-11-45678901', type: 'emergency' },
  ];
  
  // Mock data for government schemes
  const govtSchemes = [
    { 
      id: 1, 
      title: 'Jal Jeevan Mission', 
      description: 'Providing safe and adequate drinking water through individual household tap connections by 2024.',
      url: '#'
    },
    { 
      id: 2, 
      title: 'Atal Bhujal Yojana', 
      description: 'Sustainable groundwater management with community participation in water-stressed areas.',
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
  
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
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
                      Posted: {new Date(notice.date).toLocaleDateString()}
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
                        Learn more &rarr;
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
              title="Water Watch Stats" 
              className="bg-white animate-fade-in"
            >
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <Droplet className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">Active Water Issues</h4>
                    <p className="text-2xl font-semibold text-gray-900">43</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-success-100 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-success-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">Issues Resolved</h4>
                    <p className="text-2xl font-semibold text-gray-900">217</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-warning-100 p-3 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-warning-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">Urgent Issues</h4>
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
                    className="flex items-center justify-between border-b border-gray-100 last:border-b-0 pb-4 last:pb-0"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{contact.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{contact.type}</p>
                    </div>
                    <a 
                      href={`tel:${contact.phone}`}
                      className="flex items-center text-primary-600 hover:text-primary-700"
                    >
                      <Phone size={16} className="mr-1" />
                      <span className="text-sm font-medium">{contact.phone}</span>
                    </a>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-secondary-600 to-secondary-800 text-white animate-fade-in">
              <div className="text-center py-4">
                <h3 className="text-xl font-semibold mb-2">Your Water Safety Score</h3>
                <div className="inline-flex items-center justify-center rounded-full bg-white h-24 w-24 mb-4">
                  <span className="text-3xl font-bold text-secondary-600">87</span>
                </div>
                <p className="opacity-90 mb-4">Your neighborhood has good water management!</p>
                <Link to="/action-plan">
                  <Button 
                    variant="primary" 
                    className="bg-white text-secondary-800 hover:bg-gray-100"
                  >
                    View Action Plan
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