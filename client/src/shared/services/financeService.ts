import { Invoice, Expense } from '../../types';
import { apiClient } from './apiClient';
import { mockInvoices, mockExpenses } from '../mocks/mockFinance';

export const financeService = {
  async getInvoices(): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>('/finance/invoices', mockInvoices);
  },
  async getExpenses(): Promise<Expense[]> {
    return apiClient.get<Expense[]>('/finance/expenses', mockExpenses);
  },
  async getDashboardCards(): Promise<any> {
    return apiClient.get<any>('/finance/cards', null);
  },
  async createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
    return apiClient.post<Invoice>('/finance/invoices', invoice);
  },
  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    return apiClient.put<Invoice>(`/finance/invoices/${id}`, invoice);
  },
  async createExpense(expense: Partial<Expense>): Promise<Expense> {
    return apiClient.post<Expense>('/finance/expenses', expense);
  },
  async updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
    return apiClient.put<Expense>(`/finance/expenses/${id}`, expense);
  }
};
