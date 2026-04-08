'use client';

import { useAlert } from '@/contexts/alert-context';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const alertConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
    titleColor: 'text-emerald-900',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-900',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
  },
};

export function AlertToaster() {
  const { alerts, removeAlert } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-2 sm:top-4 right-2 sm:right-4 z-[100] flex flex-col gap-2 sm:gap-3 max-w-[calc(100vw-16px)] sm:max-w-md w-full pointer-events-none">
      {alerts.map((alert) => {
        const config = alertConfig[alert.type];
        const Icon = config.icon;

        return (
          <div
            key={alert.id}
            className={cn(
              'pointer-events-auto relative flex items-start gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-lg border shadow-lg',
              'animate-in slide-in-from-right-full',
              'bg-white',
              config.bgColor
            )}
          >
            <div className={cn('flex-shrink-0', config.iconColor)}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <p className={cn('text-xs sm:text-sm font-semibold', config.titleColor)}>
                {alert.title}
              </p>
              {alert.message && (
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1">
                  {alert.message}
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-5 w-5 sm:h-6 sm:w-6 -mr-1 -mt-1"
              onClick={() => removeAlert(alert.id)}
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 hover:text-slate-600 dark:text-slate-400" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
