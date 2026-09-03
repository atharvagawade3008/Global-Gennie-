import React from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { X, Bell, AlertOctagon, CheckCircle2, ShieldAlert, Users, Info, ChevronRight } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIncident?: (incidentId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectIncident,
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useIncidents();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'sos_alert': return <AlertOctagon className="w-4 h-4 text-rose-600" />;
      case 'status_update': return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      case 'zone_warning': return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case 'group_alert': return <Users className="w-4 h-4 text-violet-600" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-slate-700" />
            <h2 className="font-bold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0 aspect-square">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Bell className="w-7 h-7 text-slate-300" />
              </div>
              <p className="font-semibold text-slate-500 text-sm">No notifications yet</p>
              <p className="text-xs text-slate-400 mt-1">Safety alerts will appear here</p>
            </div>
          ) : (
            <div className="p-3 space-y-1">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (n.related_incident_id && onSelectIncident) {
                      onSelectIncident(n.related_incident_id);
                      onClose();
                    }
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    n.is_read
                      ? 'bg-white border-slate-100 hover:bg-slate-50'
                      : 'bg-blue-50/60 border-blue-200/60 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 aspect-square ${
                      n.is_read ? 'bg-slate-100' : 'bg-white border border-slate-200'
                    }`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p className={`font-semibold text-sm leading-snug ${n.is_read ? 'text-slate-600' : 'text-slate-900'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                      {n.related_incident_id && (
                        <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold mt-1.5">
                          View incident <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    {!n.is_read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 aspect-square mt-1.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
