import { useState, useEffect } from 'react';
import { UserContext, UserRole } from '../types/erp';

export const DEMO_USERS: Record<string, UserContext> = {
  'superadmin@diplon.com': {
    userId: 'usr_super_001',
    name: 'Diplon (Super Admin)',
    email: 'superadmin@diplon.com',
    role: 'SUPER_ADMIN',
    companyId: 'cmp_diplon_global',
    companyName: 'Diplon Travel ERP Headquarters',
    branchId: 'br_global_hq',
    branchName: 'Global Command Center',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    token: 'jwt_superadmin_token_889900'
  },
  'admin@diplon.com': {
    userId: 'usr_admin_002',
    name: 'Sudip Thapa (Company Admin)',
    email: 'admin@diplon.com',
    role: 'ADMIN',
    companyId: 'cmp_ktm_01',
    companyName: 'Kathmandu Travels & Tours Ltd',
    branchId: 'br_thamel_01',
    branchName: 'Thamel Main Office',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    token: 'jwt_admin_token_112233'
  },
  'agency@hikeontrek.com': {
    userId: 'usr_agency_003',
    name: 'Hike on Trek (Agency Partner)',
    email: 'agency@hikeontrek.com',
    role: 'AGENCY',
    companyId: 'cmp_hikeontrek_01',
    companyName: 'Hike on Trek',
    branchId: 'br_pokhara_01',
    branchName: 'Pokhara Agency Branch',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    token: 'jwt_agency_token_445566'
  },
  'agency@batuwatrip.com': {
    userId: 'usr_agency_005',
    name: 'Batuwa Trip (Agency Partner)',
    email: 'agency@batuwatrip.com',
    role: 'AGENCY',
    companyId: 'cmp_batuwatrip_02',
    companyName: 'Batuwa Trip',
    branchId: 'br_ktm_02',
    branchName: 'Kathmandu Agency Branch',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    token: 'jwt_agency_token_778811'
  },
  'driver@diplon.com': {
    userId: 'usr_driver_004',
    name: 'Srijan (Scorpio Driver #1)',
    email: 'driver@diplon.com',
    role: 'DRIVER',
    companyId: 'cmp_diplon_global',
    companyName: 'Diplon Scorpio Fleet Services',
    branchId: 'br_garage_01',
    branchName: 'Kathmandu Scorpio Garage',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    token: 'jwt_driver_token_778899',
    driverSn: 1,
    assignedVehicleReg: 'Ba 21 Ch 4501'
  }
};

// Aliases for legacy lookups
DEMO_USERS['agency@himalayan.com'] = DEMO_USERS['agency@hikeontrek.com'];
DEMO_USERS['srijan@diplon.com'] = DEMO_USERS['driver@diplon.com'];

const AUTH_KEY = 'diplon_auth_user';

export function useAuthStore() {
  const [user, setUser] = useState<UserContext | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const login = (email: string): boolean => {
    const key = email.toLowerCase().trim();
    const target = DEMO_USERS[key] || {
      userId: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: 'DRIVER' as UserRole,
      companyId: 'cmp_driver_custom',
      companyName: `${email.split('@')[0]} Driver Portal`,
      branchId: 'br_custom_01',
      branchName: 'Fleet Garage',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      token: `jwt_custom_token_${Date.now()}`,
      driverSn: 1,
      assignedVehicleReg: 'Ba 21 Ch 4501'
    };

    setUser(target);
    localStorage.setItem(AUTH_KEY, JSON.stringify(target));
    return true;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    let targetEmail = 'superadmin@diplon.com';
    if (newRole === 'ADMIN') targetEmail = 'admin@diplon.com';
    if (newRole === 'AGENCY') targetEmail = 'agency@hikeontrek.com';
    if (newRole === 'DRIVER') targetEmail = 'driver@diplon.com';

    const targetUser = DEMO_USERS[targetEmail];
    setUser(targetUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(targetUser));
  };

  return {
    user,
    login,
    logout,
    switchRole
  };
}
