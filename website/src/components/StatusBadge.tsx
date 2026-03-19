import React from 'react';

type StatusType = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'VERIFIED' 
  | 'CONDITIONAL' 
  | 'REJECTED' 
  | 'SUSPENDED' 
  | 'PENDING_APPROVAL' 
  | 'LIVE' 
  | 'DELISTED';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  DRAFT: { label: 'Draft', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  SUBMITTED: { label: 'Submitted', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  UNDER_REVIEW: { label: 'Under Review', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  VERIFIED: { label: 'Verified', color: 'text-green-700', bgColor: 'bg-green-100' },
  CONDITIONAL: { label: 'Conditional', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  REJECTED: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' },
  SUSPENDED: { label: 'Suspended', color: 'text-gray-900', bgColor: 'bg-gray-300' },
  PENDING_APPROVAL: { label: 'Pending Approval', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  LIVE: { label: 'Live', color: 'text-green-700', bgColor: 'bg-green-100' },
  DELISTED: { label: 'Delisted', color: 'text-red-700', bgColor: 'bg-red-100' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status as string] || { label: status, color: 'text-gray-700', bgColor: 'bg-gray-100' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide shadow-sm ${config.color} ${config.bgColor} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
