import React from 'react';

const PageContainer = ({ children, className = '' }) => {
  return (
    <div className={`container section-padding ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
