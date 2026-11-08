import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearNotification } from '../redux/rcaSlice';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const NotificationBanner = () => {
  const dispatch = useDispatch();
  const notification = useSelector((state) => state.rca.notification);

  if (!notification) return null;

  const { type, message } = notification;

  let bg = 'bg-teal-50 border-teal-200 text-teal-800';
  let icon = <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />;

  if (type === 'error') {
    bg = 'bg-red-50 border-red-200 text-red-800';
    icon = <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
  } else if (type === 'info') {
    bg = 'bg-blue-50 border-blue-200 text-blue-800';
    icon = <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />;
  }

  return (
    <div className={`border-b px-4 py-2.5 flex items-center justify-between text-sm transition-all duration-200 ${bg}`}>
      <div className="flex items-center gap-2.5 max-w-5xl mx-auto w-full">
        {icon}
        <span className="font-medium">{message}</span>
      </div>
      <button
        onClick={() => dispatch(clearNotification())}
        className="p-1 hover:bg-black/5 rounded-md transition-colors text-slate-500"
        title="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NotificationBanner;
