import { TourPackage } from '../../types';
import { apiClient } from './apiClient';
import { mockPackages } from '../mocks/mockPackages';

const PACKAGES_STORAGE_KEY = 'diplon_packages_catalog_v3';

function getStoredPackages(): TourPackage[] {
  try {
    localStorage.removeItem('diplon_packages_catalog');
    localStorage.removeItem('diplon_packages_catalog_v2');
    const saved = localStorage.getItem(PACKAGES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse stored packages:', e);
  }
  localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(mockPackages));
  return mockPackages;
}

function saveStoredPackages(pkgs: TourPackage[]) {
  try {
    localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(pkgs));
  } catch (e) {
    console.error('Failed to save packages to localStorage:', e);
  }
}

export const packageService = {
  async getPackages(): Promise<TourPackage[]> {
    const fallback = getStoredPackages();
    return apiClient.get<TourPackage[]>('/packages', fallback);
  },

  async createPackage(packageData: Partial<TourPackage>): Promise<TourPackage> {
    const current = getStoredPackages();
    const newPkg: TourPackage = {
      _id: `pkg_${Date.now()}`,
      name: packageData.name || 'New Tour Package',
      category: packageData.category || 'Standard Tour',
      durationDays: packageData.durationDays || 2,
      basePricing: packageData.basePricing || 0,
      description: packageData.description || 'Custom created tour package',
      createdAt: new Date().toISOString().split('T')[0],
      ...packageData
    };

    const updated = [newPkg, ...current];
    saveStoredPackages(updated);

    try {
      await apiClient.post<TourPackage>('/packages', newPkg, newPkg);
    } catch (e) {
      console.warn('Backend offline or failed, using local store for package creation', e);
    }

    return newPkg;
  }
};
