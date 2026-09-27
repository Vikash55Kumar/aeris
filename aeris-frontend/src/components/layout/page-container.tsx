import React from 'react';

export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`space-y-4 max-w-[1920px] mx-auto ${className}`}>{children}</div>;
};
