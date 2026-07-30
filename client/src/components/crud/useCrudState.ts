import { useState } from 'react';

export type CrudMode = 'IDLE' | 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE';

export function useCrudState<T>() {
  const [mode, setMode] = useState<CrudMode>('IDLE');
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const openView = (item: T) => {
    setSelectedItem(item);
    setMode('VIEW');
  };

  const openCreate = () => {
    setSelectedItem(null);
    setMode('CREATE');
  };

  const openEdit = (item: T) => {
    setSelectedItem(item);
    setMode('EDIT');
  };

  const openDelete = (item: T) => {
    setSelectedItem(item);
    setMode('DELETE');
  };

  const closeModal = () => {
    setSelectedItem(null);
    setMode('IDLE');
  };

  return {
    mode,
    selectedItem,
    openView,
    openCreate,
    openEdit,
    openDelete,
    closeModal,
    isOpen: mode !== 'IDLE'
  };
}
