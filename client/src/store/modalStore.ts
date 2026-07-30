import { create } from 'zustand';

// Simple lightweight global modal store
export interface ModalStoreState {
  isBookingModalOpen: boolean;
  isAddPackageModalOpen: boolean;
  isAddTourModalOpen: boolean;
  isCreateUserModalOpen: boolean;
  isCreateBranchModalOpen: boolean;
  openBookingModal: () => void;
  closeBookingModal: () => void;
  openAddPackageModal: () => void;
  closeAddPackageModal: () => void;
  openAddTourModal: () => void;
  closeAddTourModal: () => void;
  openCreateUserModal: () => void;
  closeCreateUserModal: () => void;
  openCreateBranchModal: () => void;
  closeCreateBranchModal: () => void;
}

// React useState-based hook implementation if zustand is not installed, or standard object hook
import { useState } from 'react';

// Single source of truth pub-sub listener pattern for React component re-renders
type Listener = () => void;
const listeners = new Set<Listener>();

let globalModalState = {
  isBookingModalOpen: false,
  isAddPackageModalOpen: false,
  isAddTourModalOpen: false,
  isCreateUserModalOpen: false,
  isCreateBranchModalOpen: false,
};

function notify() {
  listeners.forEach(l => l());
}

export function openBookingModal() {
  globalModalState.isBookingModalOpen = true;
  notify();
}

export function closeBookingModal() {
  globalModalState.isBookingModalOpen = false;
  notify();
}

export function openAddPackageModal() {
  globalModalState.isAddPackageModalOpen = true;
  notify();
}

export function closeAddPackageModal() {
  globalModalState.isAddPackageModalOpen = false;
  notify();
}

export function openAddTourModal() {
  globalModalState.isAddTourModalOpen = true;
  notify();
}

export function closeAddTourModal() {
  globalModalState.isAddTourModalOpen = false;
  notify();
}

export function openCreateUserModal() {
  globalModalState.isCreateUserModalOpen = true;
  notify();
}

export function closeCreateUserModal() {
  globalModalState.isCreateUserModalOpen = false;
  notify();
}

export function openCreateBranchModal() {
  globalModalState.isCreateBranchModalOpen = true;
  notify();
}

export function closeCreateBranchModal() {
  globalModalState.isCreateBranchModalOpen = false;
  notify();
}

export function useGlobalModals() {
  const [, setTick] = useState(0);

  // Subscribe to changes
  useState(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  });

  return {
    ...globalModalState,
    openBookingModal,
    closeBookingModal,
    openAddPackageModal,
    closeAddPackageModal,
    openAddTourModal,
    closeAddTourModal,
    openCreateUserModal,
    closeCreateUserModal,
    openCreateBranchModal,
    closeCreateBranchModal,
  };
}
