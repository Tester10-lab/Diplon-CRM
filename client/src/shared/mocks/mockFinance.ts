import { Invoice, Expense } from '../../types';

export const mockInvoices: Invoice[] = [
  { _id: 'inv_halesi_01', invoiceNumber: 'INV-HALESI-01', customerName: 'Halesi Group Tour', totalAmount: 87500, paidAmount: 2500, balanceDue: 85000, status: 'PARTIALLY_PAID', issueDate: '2026-07-31', dueDate: '2026-08-01' },
  { _id: 'inv_jiri_02', invoiceNumber: 'INV-JIRI-02', customerName: 'Jiri Private Tour', totalAmount: 33000, paidAmount: 0, balanceDue: 33000, status: 'ISSUED', issueDate: '2026-07-31', dueDate: '2026-08-01' },
  { _id: 'inv_mustang_03', invoiceNumber: 'INV-MUSTANG-03', customerName: 'Mustang Expedition Group', totalAmount: 115500, paidAmount: 0, balanceDue: 115500, status: 'ISSUED', issueDate: '2026-07-31', dueDate: '2026-10-28' },
  { _id: 'inv_muktinath_04', invoiceNumber: 'INV-MUKTINATH-04', customerName: 'Muktinath Yatra Group', totalAmount: 44000, paidAmount: 9600, balanceDue: 34400, status: 'PARTIALLY_PAID', issueDate: '2026-07-31', dueDate: '2026-10-25' },
];

export const mockExpenses: Expense[] = [];
