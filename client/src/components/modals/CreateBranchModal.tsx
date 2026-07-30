import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Building2, MapPin, Phone, Mail, Percent } from 'lucide-react';

export interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (branch: any) => void;
}

export const CreateBranchModal: React.FC<CreateBranchModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) onSuccess({ name, location, contactPerson, phone, commissionRate });
      onClose();
      setName('');
      setLocation('');
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Branch / Partner Account"
      description="Register a new agency branch location or B2B partner account."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Branch / Partner Name"
          icon={<Building2 className="w-4 h-4" />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Pokhara Lakefront Branch"
          required
        />

        <Input
          label="Location / City Address"
          icon={<MapPin className="w-4 h-4" />}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Lakeside Street 6, Pokhara"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Contact Person"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="e.g. Bikash Gurung"
          />

          <Input
            label="Contact Phone"
            icon={<Phone className="w-4 h-4" />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9812345678"
          />
        </div>

        <Input
          label="Partner Commission Rate (%)"
          type="number"
          icon={<Percent className="w-4 h-4" />}
          value={commissionRate}
          onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
        />

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
            {isSubmitting ? 'Registering...' : 'Save Branch / Partner'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
