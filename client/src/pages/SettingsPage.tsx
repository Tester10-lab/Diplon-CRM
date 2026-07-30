import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { Building2, Shield, Bell, Save, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Success Toast */}
      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          Settings saved successfully
        </div>
      )}

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Enterprise Tenant & System Settings</h2>
            <p className="text-xs text-slate-400 mt-1">Multi-tenant company configurations, branch isolation rules, and currency tokens</p>
          </div>
          <Button icon={<Save className="w-4 h-4" />} onClick={handleSave}>Save Changes</Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Company Name" defaultValue={user.companyName} icon={<Building2 className="w-4 h-4" />} />
            <Input label="Company ID" defaultValue={user.companyId} disabled />
            <Input label="Branch Name" defaultValue={user.branchName} />
            <Input label="Branch ID" defaultValue={user.branchId} disabled />
            <Input label="Base Currency" defaultValue="NPR (Nepalese Rupee)" disabled />
            <Input label="System Administrator Email" defaultValue={user.email} />
          </div>
        </div>
      </Card>
    </div>
  );
};
