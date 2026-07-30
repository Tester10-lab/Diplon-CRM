import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const PermissionState: React.FC<{ requiredRole?: string }> = ({ requiredRole }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
      <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400">Access Restricted</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your current account role does not have permission to view this module.
          {requiredRole && ` Requires [${requiredRole}] role.`}
        </p>
      </div>
    </div>
  );
};
