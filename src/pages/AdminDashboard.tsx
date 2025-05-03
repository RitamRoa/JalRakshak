import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  MapPin, 
  BarChart2, 
  Bell, 
  List, 
  Grid, 
  ChevronDown, 
  ChevronUp,
  Filter,
  Download,
  Search,
  ArrowUpRight,
  AlertTriangle,
  X,
  ArrowBigUp
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { useMap, WaterIssue } from '../contexts/MapContext';
import MapComponent from '../components/map/MapComponent';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { waterIssues, fetchMapData } = useMap();
  
  const [view, setView] = useState('map'); // 'map', 'list', 'analytics'
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<WaterIssue | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationForm, setNotificationForm] = useState({
    message: '',
    severity: 'high' as 'high' | 'medium' | 'low'
  });
  
  // Filters issues based on status
  const filteredIssues = statusFilter === 'all' 
    ? waterIssues 
    : waterIssues.filter(issue => issue.status === statusFilter);
  
  // Sort issues by priority and upvotes
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (a.status === 'urgent' && b.status !== 'urgent') return -1;
    if (a.status !== 'urgent' && b.status === 'urgent') return 1;
    if (a.upvote_count !== b.upvote_count) {
      return (b.upvote_count || 0) - (a.upvote_count || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Get counts by status for charts
  const statusCounts = waterIssues.reduce((counts, issue) => {
    counts[issue.status] = (counts[issue.status] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  const issueTypeCounts = waterIssues.reduce((counts, issue) => {
    counts[issue.issueType] = (counts[issue.issueType] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  // Chart data
  const statusChartData = {
    labels: Object.keys(statusCounts).map(status => t(`admin.statuses.${status}`)),
    datasets: [
      {
        label: 'Issues by Status',
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)', // urgent - red
          'rgba(59, 130, 246, 0.7)', // inProgress - blue
          'rgba(234, 179, 8, 0.7)',  // pending - yellow
          'rgba(34, 197, 94, 0.7)',  // resolved - green
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const typeChartData = {
    labels: Object.keys(issueTypeCounts).map(type => 
      t(`report.issueTypes.${type}`)
    ),
    datasets: [
      {
        label: 'Issues by Type',
        data: Object.values(issueTypeCounts),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)', // leak - blue
          'rgba(239, 68, 68, 0.7)',  // flood - red
          'rgba(234, 179, 8, 0.7)',  // contamination - yellow
          'rgba(34, 197, 94, 0.7)',  // shortage - green
          'rgba(156, 163, 175, 0.7)', // other - gray
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Function to update issue status
  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    setIsUpdating(true);
    
    try {
      if (supabase) {
        // In production, this would update the status in Supabase
        const { error } = await supabase
          .from('water_issues')
          .update({ status: newStatus })
          .eq('id', issueId);
          
        if (error) throw error;
      }
      
      // Update local state for the demo
      fetchMapData();
      
    } catch (err) {
      console.error('Error updating issue status:', err);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Function to send notification
  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notificationMessage) {
      return;
    }
    
    try {
      // In production, this would send the notification through a service
      // For now, we'll just simulate success
      
      alert(`Notification sent: ${notificationMessage}`);
      setNotificationMessage('');
      setShowNotificationForm(false);
      
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };
  
  // Helper function to determine badge color based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'inProgress':
        return 'primary';
      case 'resolved':
        return 'success';
      case 'urgent':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Helper for severity indication
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
  
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('emergency_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    setNotifications(data || []);
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('emergency_notifications')
        .insert([
          {
            message: notificationForm.message,
            severity: notificationForm.severity,
          }
        ])
        .select();

      if (error) {
        console.error('Error creating notification:', error);
        return;
      }

      console.log('Created notification:', data);
      setShowNotificationForm(false);
      setNotificationForm({
        message: '',
        severity: 'high'
      });
    } catch (err) {
      console.error('Error in handleCreateNotification:', err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('emergency_notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      return;
    }

    fetchNotifications();
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-display font-bold text-gray-900 leading-7 sm:truncate">
              {t('admin.title')}
            </h1>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                Admin: {user?.email}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                Total Issues: {waterIssues.length}
              </div>
            </div>
          </div>
          <div className="mt-4 flex md:mt-0">
            <Button
              onClick={() => setShowNotificationForm(!showNotificationForm)}
              icon={<Bell />}
              variant="danger"
            >
              {t('admin.notifications')}
            </Button>
          </div>
        </div>
        
        {/* Emergency Notification Form */}
        {showNotificationForm && (
          <Card className="mb-6 animate-fade-in">
            <form onSubmit={handleCreateNotification} className="p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    {t('admin.notification.title')}
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder={t('admin.notification.placeholder')}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                    Severity
                  </label>
                  <select
                    id="severity"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={notificationForm.severity}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, severity: e.target.value as 'high' | 'medium' | 'low' }))}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowNotificationForm(false)}
                    type="button"
                  >
                    {t('admin.notification.cancel')}
                  </Button>
                  <Button variant="danger" type="submit" icon={<Bell />}>
                    {t('admin.notification.send')}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        )}
        
        {/* View Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setView('map')}
              className={`${
                view === 'map'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <MapPin className="mr-2 h-5 w-5" />
              {t('admin.views.map')}
            </button>
            <button
              onClick={() => setView('list')}
              className={`${
                view === 'list'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <List className="mr-2 h-5 w-5" />
              {t('admin.views.list')}
            </button>
            <button
              onClick={() => setView('analytics')}
              className={`${
                view === 'analytics'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <BarChart2 className="mr-2 h-5 w-5" />
              {t('admin.views.analytics')}
            </button>
          </nav>
        </div>
        
        {/* Status Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 flex items-center">
            <Filter className="mr-1 h-4 w-4" />
            {t('admin.filters.title')}:
          </span>
          <Button
            variant={statusFilter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            {t('admin.filters.all')}
          </Button>
          <Button
            variant={statusFilter === 'urgent' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('urgent')}
          >
            {t('admin.filters.urgent')}
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('pending')}
          >
            {t('admin.filters.pending')}
          </Button>
          <Button
            variant={statusFilter === 'inProgress' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('inProgress')}
          >
            {t('admin.filters.inProgress')}
          </Button>
          <Button
            variant={statusFilter === 'resolved' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('resolved')}
          >
            {t('admin.filters.resolved')}
          </Button>
        </div>
        
        {/* Main Content */}
        {view === 'map' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-[600px]">
              <MapComponent />
            </div>
          </div>
        )}
        
        {view === 'list' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">{t('admin.reports')}</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" icon={<Download />}>
                    {t('admin.table.export')}
                  </Button>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder={t('admin.table.search')}
                    />
                  </div>
                </div>
              </div>
              
              {sortedIssues.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">{t('admin.table.noIssues')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.table.issueType')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.table.description')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.table.severity')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.table.status')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.table.upvotes')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.table.date')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('admin.table.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedIssues.map((issue) => (
                        <tr key={issue.id} className={issue.status === 'urgent' ? 'bg-error-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 capitalize">
                              {t(`report.issueTypes.${issue.issueType}`)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {issue.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getSeverityBadgeVariant(issue.severity)}>
                              {t(`report.severityLevels.${issue.severity}`)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getStatusBadgeVariant(issue.status)}>
                              {t(`admin.statuses.${issue.status}`)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <ArrowBigUp className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">
                                {issue.upvote_count || 0}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <select
                                value={issue.status}
                                onChange={(e) => updateIssueStatus(issue.id, e.target.value)}
                                className="block w-full text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                disabled={isUpdating}
                              >
                                <option value="pending">Pending</option>
                                <option value="inProgress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="urgent">Urgent</option>
                              </select>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setSelectedIssue(issue)}
                                icon={<ArrowUpRight size={14} />}
                              >
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        
        {view === 'analytics' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                    <MapPin size={24} />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Total Issues</p>
                    <h3 className="text-xl font-semibold text-gray-900">{waterIssues.length}</h3>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-white">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-warning-100 text-warning-600">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Pending Issues</p>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {statusCounts.pending || 0}
                    </h3>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-white">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-error-100 text-error-600">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Urgent Issues</p>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {statusCounts.urgent || 0}
                    </h3>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-white">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-success-100 text-success-600">
                    <BarChart2 size={24} />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Resolution Rate</p>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {waterIssues.length > 0 ? `${Math.round((statusCounts.resolved || 0) / waterIssues.length * 100)}%` : '0%'}
                    </h3>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title={t('admin.charts.issuesByStatus')}>
                <div className="h-64">
                  <Pie data={statusChartData} />
                </div>
              </Card>
              
              <Card title={t('admin.charts.issuesByType')}>
                <div className="h-64">
                  <Bar data={typeChartData} />
                </div>
              </Card>
            </div>
            
            {/* Trends */}
            <Card title="Water Issue Trends" className="bg-white">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-500 mb-4">
                  Monthly issue reports over the past 6 months
                </p>
                <div className="h-64">
                  <Bar 
                    data={{
                      labels: ['December', 'January', 'February', 'March', 'April', 'May'],
                      datasets: [
                        {
                          label: 'Leaks',
                          data: [12, 19, 15, 21, 18, 25],
                          backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        },
                        {
                          label: 'Flooding',
                          data: [5, 7, 9, 14, 10, 8],
                          backgroundColor: 'rgba(239, 68, 68, 0.5)',
                        },
                        {
                          label: 'Contamination',
                          data: [3, 5, 2, 8, 6, 9],
                          backgroundColor: 'rgba(234, 179, 8, 0.5)',
                        },
                      ],
                    }}
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          stacked: true,
                        },
                        y: {
                          stacked: true,
                          beginAtZero: true,
                          ticks: {
                            precision: 0
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {/* Issue Detail Modal */}
        {selectedIssue && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedIssue(null)}></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Issue Details
                      </h3>
                      <div className="mt-4">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Issue Type</dt>
                            <dd className="mt-1 text-sm text-gray-900 capitalize">
                              {t(`report.issueTypes.${selectedIssue.issueType}`)}
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              <Badge variant={getStatusBadgeVariant(selectedIssue.status)}>
                                {t(`admin.statuses.${selectedIssue.status}`)}
                              </Badge>
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Severity</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              <Badge variant={getSeverityBadgeVariant(selectedIssue.severity)}>
                                {t(`report.severityLevels.${selectedIssue.severity}`)}
                              </Badge>
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Date Reported</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {new Date(selectedIssue.createdAt).toLocaleDateString()}
                            </dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Location</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {selectedIssue.location[0].toFixed(6)}, {selectedIssue.location[1].toFixed(6)}
                            </dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {selectedIssue.description}
                            </dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Update Status</dt>
                            <dd className="mt-1">
                              <select
                                value={selectedIssue.status}
                                onChange={(e) => updateIssueStatus(selectedIssue.id, e.target.value)}
                                className="block w-full text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                disabled={isUpdating}
                              >
                                <option value="pending">Pending</option>
                                <option value="inProgress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    onClick={() => setSelectedIssue(null)}
                    className="ml-3"
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => console.log('Assigning personnel')}
                  >
                    Assign Personnel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Notifications Section */}
        <Card className="bg-white mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Emergency Notifications</h3>
              <Button
                variant="primary"
                onClick={() => setShowNotificationForm(true)}
              >
                Create Notification
              </Button>
            </div>

            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-4 rounded-lg border ${
                    notification.severity === 'high'
                      ? 'bg-error-50 border-error-200'
                      : notification.severity === 'medium'
                      ? 'bg-warning-50 border-warning-200'
                      : 'bg-info-50 border-info-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <AlertTriangle className={`h-5 w-5 ${
                          notification.severity === 'high'
                            ? 'text-error-400'
                            : notification.severity === 'medium'
                            ? 'text-warning-400'
                            : 'text-info-400'
                        }`} />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          Posted: {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="inline-flex rounded-md p-1.5 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      <span className="sr-only">Dismiss</span>
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-center text-gray-500 py-4">No active emergency notifications</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;