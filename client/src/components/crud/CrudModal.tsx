import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CrudMode } from './useCrudState';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface CrudModalProps<T> {
  mode: CrudMode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  item?: T | null;
  onSave?: (data: Partial<T>) => void;
  onConfirmDelete?: (item: T) => void;
  formId?: string;
  children?: React.ReactNode;
}

export function CrudModal<T>({
  mode,
  isOpen,
  onClose,
  title,
  item,
  onSave,
  onConfirmDelete,
  formId,
  children
}: CrudModalProps<T>) {
  if (!isOpen) return null;

  if (mode === 'DELETE') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion" maxWidth="sm">
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div className="text-xs font-semibold">
              Are you sure you want to delete this record? This action cannot be undone.
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => { if (item && onConfirmDelete) onConfirmDelete(item); onClose(); }}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${mode === 'CREATE' ? 'Create New' : mode === 'EDIT' ? 'Edit' : 'View'} ${title}`}
    >
      <div className="space-y-4">
        {children}
        {mode !== 'VIEW' && (
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            {formId ? (
              <Button type="submit" form={formId} size="sm" icon={<CheckCircle2 className="w-4 h-4" />}>
                {mode === 'CREATE' ? 'Save Record' : 'Update Record'}
              </Button>
            ) : (
              <Button size="sm" onClick={() => { if (onSave) onSave({}); onClose(); }} icon={<CheckCircle2 className="w-4 h-4" />}>
                {mode === 'CREATE' ? 'Save Record' : 'Update Record'}
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
