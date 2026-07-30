import { UserRole } from '../../types';

export interface ApiClientConfig {
  baseUrl?: string;
  role?: UserRole;
  companyId?: string;
  branchId?: string;
  employeeId?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(config: ApiClientConfig = {}) {
    const envApi = typeof import.meta !== 'undefined' ? import.meta?.env?.VITE_API_URL : undefined;
    this.baseUrl = config.baseUrl || (envApi ? (envApi.endsWith('/api') ? envApi : `${envApi}/api`) : '/api');
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-mock-role': localStorage.getItem('diplon_user_role') || 'SUPER_ADMIN',
      'x-mock-company-id': 'cmp_diplon_01',
      'x-mock-branch-id': 'br_thamel_01',
      'x-mock-employee-id': 'usr_admin_001',
    };
  }

  public async get<T>(endpoint: string, fallbackData?: T): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (fallbackData !== undefined) return fallbackData;
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return json.data !== undefined ? json.data : json;
    } catch (err) {
      if (fallbackData !== undefined) {
        return fallbackData;
      }
      throw err;
    }
  }

  public async post<T>(endpoint: string, body: any, fallbackData?: T): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (fallbackData !== undefined) return fallbackData;
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return json.data !== undefined ? json.data : json;
    } catch (err) {
      if (fallbackData !== undefined) {
        return fallbackData;
      }
      throw err;
    }
  }

  public async put<T>(endpoint: string, body: any, fallbackData?: T): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (fallbackData !== undefined) return fallbackData;
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return json.data !== undefined ? json.data : json;
    } catch (err) {
      if (fallbackData !== undefined) {
        return fallbackData;
      }
      throw err;
    }
  }

  public async delete<T>(endpoint: string, fallbackData?: T): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (fallbackData !== undefined) return fallbackData;
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return json.data !== undefined ? json.data : json;
    } catch (err) {
      if (fallbackData !== undefined) {
        return fallbackData;
      }
      throw err;
    }
  }
}

export const apiClient = new ApiClient();
