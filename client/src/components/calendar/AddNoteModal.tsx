import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FileText, Calendar, StickyNote, Tag, Check } from 'lucide-react';

export interface CalendarNote {
  id: string;
  title: string;
  date: string;
  category: 'General' | 'Operational' | 'Fleet' | 'Payment';
  description?: string;
  createdAt: string;
}

export interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNote: (note: CalendarNote) => void;
  initialDate?: string;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  onSaveNote,
  initialDate
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<'General' | 'Operational' | 'Fleet' | 'Payment'>('General');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);

    const newNote: CalendarNote = {
      id: `note_${Date.now()}`,
      title: title.trim(),
      date,
      category,
      description: description.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    onSaveNote(newNote);
    setIsSubmitting(false);
    onClose();
    setTitle('');
    setDescription('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Calendar Note & Operational Reminder"
      description="Pin a note or operational reminder directly onto specific calendar dates."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Note Title / Summary"
          icon={<StickyNote className="w-4 h-4 text-amber-500" />}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Check Kalinchowk jeep road status & snow conditions"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Calendar Date"
            type="date"
            icon={<Calendar className="w-4 h-4" />}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Category / Priority
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-medium"
            >
              <option value="General">📝 General Reminder</option>
              <option value="Operational">⚠️ Operational Alert</option>
              <option value="Fleet">🚌 Driver / Fleet Note</option>
              <option value="Payment">💰 Payment Settlement Note</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
            Details & Instructions
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add detailed operational instructions, driver notes, or client follow-ups..."
            rows={3}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6">
            <Check className="w-4 h-4" />
            Save & Pin Note to Calendar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
