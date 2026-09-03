import React from 'react';
import { IncidentPriority, IncidentStatus, ZoneRiskLevel, LostFoundStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'safe' | 'warning' | 'danger' | 'purple' | 'navy' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    safe: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    navy: 'bg-slate-800 text-slate-100 border-slate-700',
    outline: 'bg-transparent text-slate-600 border-slate-300',
  };

  const dotColors = {
    default: 'bg-slate-400',
    primary: 'bg-blue-500',
    safe: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    purple: 'bg-purple-500',
    navy: 'bg-slate-300',
    outline: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-[11px] font-semibold px-2.5 py-0.5 leading-normal',
    md: 'text-xs font-semibold px-3 py-1 leading-normal',
    lg: 'text-sm font-semibold px-3.5 py-1.5 leading-normal',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap shrink-0 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 aspect-square ${dotColors[variant]}`} />}
      <span className="truncate">{children}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: IncidentPriority }> = ({ priority }) => {
  switch (priority) {
    case 'critical':
      return <Badge variant="danger" dot>Critical Priority</Badge>;
    case 'high':
      return <Badge variant="warning" dot>High Priority</Badge>;
    case 'medium':
      return <Badge variant="primary" dot>Medium Priority</Badge>;
    case 'low':
      return <Badge variant="safe" dot>Low Priority</Badge>;
    default:
      return <Badge>{priority}</Badge>;
  }
};

export const StatusBadge: React.FC<{ status: IncidentStatus }> = ({ status }) => {
  switch (status) {
    case 'received':
      return <Badge variant="default" dot>Received</Badge>;
    case 'reviewing':
      return <Badge variant="purple" dot>Reviewing</Badge>;
    case 'assigned':
      return <Badge variant="primary" dot>Assigned</Badge>;
    case 'response_en_route':
      return <Badge variant="warning" dot>En Route</Badge>;
    case 'on_scene':
      return <Badge variant="warning" dot>On Scene</Badge>;
    case 'resolved':
      return <Badge variant="safe" dot>Resolved</Badge>;
    case 'cancelled':
      return <Badge variant="outline">Cancelled</Badge>;
    default:
      return <Badge>{String(status)}</Badge>;
  }
};

export const RiskBadge: React.FC<{ level: ZoneRiskLevel }> = ({ level }) => {
  switch (level) {
    case 'safe':
      return <Badge variant="safe" dot>Safe Haven</Badge>;
    case 'advisory':
      return <Badge variant="primary" dot>Advisory Zone</Badge>;
    case 'warning':
      return <Badge variant="warning" dot>Caution Zone</Badge>;
    case 'danger':
      return <Badge variant="danger" dot>High Danger</Badge>;
    case 'restricted':
      return <Badge variant="navy" dot>Restricted</Badge>;
    default:
      return <Badge>{level}</Badge>;
  }
};

export const LostFoundBadge: React.FC<{ status: LostFoundStatus }> = ({ status }) => {
  switch (status) {
    case 'reported_lost':
      return <Badge variant="warning" dot>Reported Lost</Badge>;
    case 'reported_found':
      return <Badge variant="primary" dot>Reported Found</Badge>;
    case 'claimed':
      return <Badge variant="purple" dot>Claim in Review</Badge>;
    case 'returned':
      return <Badge variant="safe" dot>Returned to Owner</Badge>;
    case 'closed':
      return <Badge variant="outline">Closed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};
