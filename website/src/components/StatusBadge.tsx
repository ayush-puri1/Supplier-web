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
  style?: React.CSSProperties;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'VERIFIED': case 'LIVE':
      return { dot: '#34D399', bg: 'rgba(52,211,153,0.1)', color: '#34D399', label: status };
    case 'SUBMITTED': case 'PENDING_APPROVAL': case 'UNDER_REVIEW':
      return { dot: '#FBBF24', bg: 'rgba(251,191,36,0.1)', color: '#FBBF24', label: 'PENDING' };
    case 'REJECTED': case 'DELISTED': case 'SUSPENDED':
      return { dot: '#F87171', bg: 'rgba(248,113,113,0.1)', color: '#F87171', label: status };
    default:
      return { dot: '#60A5FA', bg: 'rgba(96,165,250,0.1)', color: '#60A5FA', label: status };
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', style }) => {
  const sc = getStatusConfig(status as string);

  return (
    <span 
      className={className}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: 5, 
        padding: '4px 10px', 
        borderRadius: 999, 
        fontFamily: "'DM Sans', sans-serif", 
        fontSize: 9, 
        fontWeight: 700, 
        letterSpacing: '0.07em', 
        textTransform: 'uppercase', 
        color: sc.color, 
        background: sc.bg,
        ...style
      }}
    >
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: sc.dot, boxShadow: `0 0 5px ${sc.dot}` }} />
      {sc.label}
    </span>
  );
};

export default StatusBadge;
