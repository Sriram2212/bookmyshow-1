const EmptyState = ({ 
  title, 
  description, 
  icon, 
  action 
}) => {
  const defaultIcon = (
    <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4" />
    </svg>
  );

  return (
    <div className="text-center py-12 px-4">
      <div className="mb-4">
        {icon || defaultIcon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || 'No data found'}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description || 'There are no items to display at the moment.'}
      </p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
