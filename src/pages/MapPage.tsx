import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, Filter } from 'lucide-react';
import MapComponent from '../components/map/MapComponent';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useMap, WaterIssue } from '../contexts/MapContext';

const MapPage = () => {
  const { t } = useTranslation();
  const { 
    waterIssues, 
    toggleLayer, 
    visibleLayers, 
    selectedIssue, 
    isLoading, 
    error, 
    fetchMapData 
  } = useMap();
  
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  
  // Apply filters to water issues
  const filteredIssues = waterIssues.filter(issue => {
    if (filterStatus && issue.status !== filterStatus) return false;
    if (filterType && issue.issueType !== filterType) return false;
    return true;
  });
  
  const handleLayerToggle = (layer: string) => {
    toggleLayer(layer, !visibleLayers[layer]);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning-500';
      case 'inProgress':
        return 'bg-primary-500';
      case 'resolved':
        return 'bg-success-500';
      case 'urgent':
        return 'bg-error-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case 'leak':
        return '💧';
      case 'flood':
        return '🌊';
      case 'contamination':
        return '⚠️';
      case 'shortage':
        return '🚰';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative h-[calc(100vh-4rem)]">
        {/* Map Container */}
        <div className="absolute inset-0 z-0">
          <MapComponent />
        </div>
        
        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 z-20 space-y-4 w-80">
          {/* Layer Controls */}
          <Card className="bg-white bg-opacity-95">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <Layers size={18} className="mr-2" />
                  Map Layers
                </h3>
              </div>
              
              <div className="space-y-2">
                {Object.entries(visibleLayers).map(([layer, isVisible]) => (
                  <div key={layer} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`layer-${layer}`}
                      checked={isVisible}
                      onChange={() => handleLayerToggle(layer)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`layer-${layer}`} className="ml-2 block text-sm text-gray-700">
                      {t(`map.layers.${layer}`)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          
          {/* Filters */}
          <Card className="bg-white bg-opacity-95">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <Filter size={18} className="mr-2" />
                  Filters
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                  <select
                    value={filterType || ''}
                    onChange={(e) => setFilterType(e.target.value || null)}
                    className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:ring-primary-500 focus:border-primary-500 rounded-md"
                  >
                    <option value="">All Types</option>
                    <option value="leak">Water Leak</option>
                    <option value="flood">Flooding</option>
                    <option value="contamination">Contamination</option>
                    <option value="shortage">Water Shortage</option>
                    <option value="other">Other Issue</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filterStatus || ''}
                    onChange={(e) => setFilterStatus(e.target.value || null)}
                    className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:ring-primary-500 focus:border-primary-500 rounded-md"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="inProgress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Issues shown:</span>
                  <span className="font-medium">{filteredIssues.length}</span>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Legend */}
          <Card className="bg-white bg-opacity-95">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Legend</h3>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">Issue Types</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <span className="mr-1.5">{getIssueTypeIcon('leak')}</span>
                      <span>{t('map.legend.leak')}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <span className="mr-1.5">{getIssueTypeIcon('flood')}</span>
                      <span>{t('map.legend.flood')}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <span className="mr-1.5">{getIssueTypeIcon('contamination')}</span>
                      <span>{t('map.legend.contamination')}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <span className="mr-1.5">{getIssueTypeIcon('shortage')}</span>
                      <span>{t('map.legend.shortage')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">Status Colors</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <span className={`w-3 h-3 rounded-full ${getStatusColor('pending')} mr-1.5`}></span>
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <span className={`w-3 h-3 rounded-full ${getStatusColor('inProgress')} mr-1.5`}></span>
                      <span>In Progress</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <span className={`w-3 h-3 rounded-full ${getStatusColor('resolved')} mr-1.5`}></span>
                      <span>Resolved</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <span className={`w-3 h-3 rounded-full ${getStatusColor('urgent')} mr-1.5`}></span>
                      <span>Urgent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Selected Issue Detail */}
        {selectedIssue && (
          <div className="absolute bottom-4 left-4 z-10 w-80">
            <Card className="bg-white bg-opacity-95 animate-slide-up">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">
                    {t(`report.issueTypes.${selectedIssue.issueType}`)}
                  </h3>
                  <Badge 
                    variant={
                      selectedIssue.severity === 'high' || selectedIssue.severity === 'critical' 
                        ? 'error' 
                        : selectedIssue.severity === 'medium' 
                        ? 'warning' 
                        : 'success'
                    }
                  >
                    {t(`report.severityLevels.${selectedIssue.severity}`)}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{selectedIssue.description}</p>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(selectedIssue.status)} mr-1`}></span>
                    <span className="capitalize">{t(`admin.statuses.${selectedIssue.status}`)}</span>
                  </div>
                  <span className="text-gray-500">
                    {new Date(selectedIssue.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;