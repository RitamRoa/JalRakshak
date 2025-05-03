import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmergencyNotification {
  id: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  created_at: string;
}

interface EmergencyNotificationProps {
  notifications: EmergencyNotification[];
  onDismiss?: (id: string) => void;
}

const EmergencyNotification: React.FC<EmergencyNotificationProps> = ({ notifications, onDismiss }) => {
  const { t } = useTranslation();

  if (!notifications.length) return null;

  const getSeverityStyles = (severity: EmergencyNotification['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-error-50 text-error-700 border-error-200';
      case 'medium':
        return 'bg-warning-50 text-warning-700 border-warning-200';
      case 'low':
        return 'bg-info-50 text-info-700 border-info-200';
      default:
        return 'bg-error-50 text-error-700 border-error-200';
    }
  };

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`relative px-4 py-3 rounded-lg border ${getSeverityStyles(notification.severity)} animate-fade-in`}
          role="alert"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
              <p className="mt-1 text-xs text-gray-500">
                {new Date(notification.created_at).toLocaleDateString()}
              </p>
            </div>
            {onDismiss && (
              <div className="ml-3">
                <button
                  type="button"
                  className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500"
                  onClick={() => onDismiss(notification.id)}
                >
                  <span className="sr-only">{t('common.dismiss')}</span>
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmergencyNotification; 