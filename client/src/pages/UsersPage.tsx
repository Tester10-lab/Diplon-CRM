import React, { useState } from 'react';
import { DataTable, Column } from '../components/tables/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { UserRole } from '../types/erp';
import { useAuthStore } from '../store/authStore';
import { UserCog, Plus, ShieldCheck, Mail, Lock, Building2, Key, CheckCircle2, UserX, Sparkles, RefreshCw } from 'lucide-react';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  companyName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin: string;
}

const INITIAL_USERS: SystemUser[] = [
  {
    id: 'usr_super_001',
    name: 'Diplon',
    email: 'superadmin@diplon.com',
    role: 'SUPER_ADMIN',
    companyId: 'cmp_diplon_global',
    companyName: 'Diplon Travel ERP Headquarters',
    status: 'ACTIVE',
    lastLogin: '2026-07-30 15:45'
  },
  {
    id: 'usr_admin_002',
    name: 'Sudip Thapa',
    email: 'admin@diplon.com',
    role: 'ADMIN',
    companyId: 'cmp_ktm_01',
    companyName: 'Kathmandu Travels & Tours Ltd',
    status: 'ACTIVE',
    lastLogin: '2026-07-30 14:20'
  },
  {
    id: 'usr_agency_003',
    name: 'Hike on Trek',
    email: 'agency@hikeontrek.com',
    role: 'AGENCY',
    companyId: 'cmp_hikeontrek_01',
    companyName: 'Hike on Trek',
    status: 'ACTIVE',
    lastLogin: '2026-07-30 12:10'
  },
  {
    id: 'usr_agency_004',
    name: 'Batuwa Trip',
    email: 'agency@batuwatrip.com',
    role: 'AGENCY',
    companyId: 'cmp_batuwatrip_02',
    companyName: 'Batuwa Trip',
    status: 'ACTIVE',
    lastLogin: '2026-07-30 11:30'
  },
  {
    id: 'usr_driver_005',
    name: 'Srijan',
    email: 'driver@diplon.com',
    role: 'DRIVER',
    companyId: 'cmp_diplon_global',
    companyName: 'Diplon Scorpio Fleet Services',
    status: 'ACTIVE',
    lastLogin: '2026-07-30 10:15'
  }
];

export const UsersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [usersList, setUsersList] = useState<SystemUser[]>(INITIAL_USERS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('AGENCY');
  const [formCompanyName, setFormCompanyName] = useState('Hike on Trek');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    const newUser: SystemUser = {
      id: `usr_${Date.now()}`,
      name: formName,
      email: formEmail,
      role: formRole,
      companyId: `cmp_${formRole.toLowerCase()}_${Date.now()}`,
      companyName: formCompanyName,
      status: 'ACTIVE',
      lastLogin: 'Just registered'
    };

    setUsersList(prev => [newUser, ...prev]);
    setIsAddModalOpen(false);
    showToast(`✅ Created user account for ${formName} (${formRole})`);

    setFormName('');
    setFormEmail('');
  };

  const handleToggleStatus = (id: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        showToast(`⚡ Account status for ${u.name} updated to ${nextStatus}`);
        return { ...u, status: nextStatus as any };
      }
      return u;
    }));
  };

  const handleResetPassword = (email: string) => {
    showToast(`🔑 Password reset link sent to ${email}`);
  };

  const columns: Column<SystemUser>[] = [
    {
      key: 'name',
      header: 'User & Email',
      accessor: u => (
        <div>
          <div className="font-bold text-white text-sm">{u.name}</div>
          <div className="text-xs text-indigo-400 font-mono">{u.email}</div>
        </div>
      )
    },
    {
      key: 'companyName',
      header: 'Company Tenant',
      accessor: u => (
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{u.companyName}</span>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Assigned Role',
      accessor: u => (
        <Badge
          variant={
            u.role === 'SUPER_ADMIN' ? 'danger' : u.role === 'ADMIN' ? 'primary' : 'info'
          }
          dot
        >
          {u.role}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Account Status',
      accessor: u => (
        <Badge variant={u.status === 'ACTIVE' ? 'success' : 'neutral'}>
          {u.status}
        </Badge>
      )
    },
    {
      key: 'lastLogin',
      header: 'Last Active',
      accessor: u => <span className="font-mono text-xs text-slate-400">{u.lastLogin}</span>
    },
    {
      key: 'actions',
      header: 'Management Controls',
      accessor: u => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200"
            onClick={() => handleResetPassword(u.email)}
            title="Reset Password"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset</span>
          </Button>

          <Button
            size="sm"
            variant={u.status === 'ACTIVE' ? 'secondary' : 'primary'}
            className={`text-xs ${
              u.status === 'ACTIVE'
                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border-rose-500/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold'
            }`}
            onClick={() => handleToggleStatus(u.id)}
          >
            {u.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-bold border border-indigo-400/40">
          <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <UserCog className="w-6 h-6 text-indigo-400" />
            User Management & Multi-Tenant Role Permissions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage system users across Super Admin, Company Admin, Agency B2B partners, and Driver accounts
          </p>
        </div>

        {user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? (
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create System User</span>
          </Button>
        ) : null}
      </div>

      {/* User Roster Data Table */}
      <DataTable
        title="Active System Accounts Roster"
        description="Filter users by role, activate/deactivate access, or send password reset links"
        data={usersList as any}
        columns={columns}
        searchPlaceholder="Search user name, email, company..."
      />

      {/* Create User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New System User Account"
        description="Assign role, company tenant, and email credentials for the new ERP user."
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full User Name"
            value={formName}
            onChange={e => setFormName(e.target.value)}
            placeholder="e.g. Hike on Trek"
            required
          />

          <Input
            label="Email Address (Username)"
            type="email"
            icon={<Mail className="w-4 h-4" />}
            value={formEmail}
            onChange={e => setFormEmail(e.target.value)}
            placeholder="e.g. agency@hikeontrek.com"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                System Role
              </label>
              <select
                value={formRole}
                onChange={e => setFormRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="SUPER_ADMIN">SUPER_ADMIN (Full System Access)</option>
                <option value="ADMIN">ADMIN (Company Admin Access)</option>
                <option value="AGENCY">AGENCY (Agency B2B Portal)</option>
                <option value="DRIVER">DRIVER (Scorpio Driver Portal)</option>
              </select>
            </div>

            <Input
              label="Company Name Tenant"
              value={formCompanyName}
              onChange={e => setFormCompanyName(e.target.value)}
              placeholder="e.g. Hike on Trek"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              Create User
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
