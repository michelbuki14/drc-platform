'use client';

import { HTMLAttributes } from 'react';
import { Button } from './Button';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action, className = '', ...props }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`} {...props}>
      {icon && (
        <div className="mb-4 p-4 bg-[#FAF8F3] rounded-full border border-[#E2DFD9]">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-bold text-[#0B2545] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#7D7A74] text-center mb-4 max-w-md">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="primary" size="md">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
