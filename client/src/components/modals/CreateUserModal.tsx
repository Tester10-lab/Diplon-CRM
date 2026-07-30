import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { User, Mail, Shield, Building, Phone } from 'lucide-react';

export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'SUPER_ADMIN' | 'SALES' | 'OPERATIONS' | 'FINANCE'>('SALES');
  const [branch, setBranch] = useState('Thamel HQ Branch');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) onSuccess({ name, email, role, branch });
      onClose();
      setName('');
      setEmail('');
      setPhone('');
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New System User"
      description="Add a new staff user account with specific role-based permissions."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          icon={<User className="w-4 h-4" />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Anil Shrestha"
          required
        />

        <Input
          label="Email Address"
          type="email"
          icon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. anil@diplontravels.com"
          required
        />

        <Input
          label="Phone Number"
          icon={<Phone className="w-4 h-4" />}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 9801234567"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Assigned User Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="SUPER_ADMIN">SUPER ADMIN</option>
              <option value="SALES">SALES & CRM</option>
              <option value="OPERATIONS">OPERATIONS & DISPATCH</option>
              <option value="FINANCE">FINANCE & ACCOUNTING</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Assigned Branch
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="Thamel HQ Branch">Thamel HQ Branch</option>
              <option value="Pokhara Regional Branch">Pokhara Regional Branch</option>
              <option value="Chitwan Operations Hub">Chitwan Operations Hub</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
            {isSubmitting ? 'Creating...' : 'Create User Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
