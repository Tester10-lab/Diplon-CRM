import { Invoice, Expense } from '../../types';

export const mockInvoices: Invoice[] = [
  { _id: 'inv_10924', invoiceNumber: 'INV-10924', customerName: 'Ram Shrestha', totalAmount: 450000, paidAmount: 300000, balanceDue: 150000, status: 'PARTIALLY_PAID', issueDate: '2026-06-01', dueDate: '2026-06-30' },
  { _id: 'inv_10925', invoiceNumber: 'INV-10925', customerName: 'Sita Karki', totalAmount: 240000, paidAmount: 240000, balanceDue: 0, status: 'PAID', issueDate: '2026-06-05', dueDate: '2026-07-05' },
  { _id: 'inv_10926', invoiceNumber: 'INV-10926', customerName: 'Hari Gurung', totalAmount: 400000, paidAmount: 0, balanceDue: 400000, status: 'ISSUED', issueDate: '2026-06-10', dueDate: '2026-07-10' },
  { _id: 'inv_10927', invoiceNumber: 'INV-10927', customerName: 'Anita Thapa', totalAmount: 360000, paidAmount: 180000, balanceDue: 180000, status: 'PARTIALLY_PAID', issueDate: '2026-06-18', dueDate: '2026-07-18' },
  { _id: 'inv_10928', invoiceNumber: 'INV-10928', customerName: 'John Smith', totalAmount: 320000, paidAmount: 320000, balanceDue: 0, status: 'PAID', issueDate: '2026-06-25', dueDate: '2026-07-25' },
];

export const mockExpenses: Expense[] = [
  { _id: 'exp_8891', category: 'FUEL', description: 'Fuel Reimbursement - Tourist Bus BA-2-PA-1234', amount: 15000, paymentMode: 'Cash', status: 'APPROVED', date: '2026-07-22' },
  { _id: 'exp_8892', category: 'ACCOMMODATION', description: 'Yak & Yeti Hotel Block Advance Deposit', amount: 85000, paymentMode: 'Bank Transfer', status: 'APPROVED', date: '2026-07-23' },
  { _id: 'exp_8893', category: 'FLIGHTS', description: 'Kathmandu-Lukla Flight Tickets (10 Pax)', amount: 160000, paymentMode: 'ConnectIPS', status: 'PENDING_APPROVAL', date: '2026-07-25' },
  { _id: 'exp_8894', category: 'PERMITS', description: 'TIMS & Sagarmatha National Park Permits', amount: 45000, paymentMode: 'eSewa', status: 'APPROVED', date: '2026-07-26' },
];
