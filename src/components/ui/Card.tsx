import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  bordered?: boolean;
  hoverEffect?: boolean;
  role?: string;
  'aria-label'?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  headerAction,
  footer,
  bordered = false,
  hoverEffect = false,
  role,
  'aria-label': ariaLabel,
}) => {
  const borderClass = bordered ? 'border border-gray-200' : '';
  const hoverClass = hoverEffect ? 'transition-all duration-200 hover:shadow-lg' : '';
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden ${borderClass} ${hoverClass} ${className}`}
      role={role}
      aria-label={ariaLabel}
    >
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      
      <div className="px-6 py-4">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;