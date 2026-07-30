export const queryKeys = {
  customers: {
    all: ['customers'] as const,
    list: () => [...queryKeys.customers.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.customers.all, 'detail', id] as const,
    inquiries: () => [...queryKeys.customers.all, 'inquiries'] as const,
    quotations: () => [...queryKeys.customers.all, 'quotations'] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    list: () => [...queryKeys.bookings.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.bookings.all, 'detail', id] as const,
  },
  operations: {
    all: ['operations'] as const,
    departures: () => [...queryKeys.operations.all, 'departures'] as const,
    fleet: () => [...queryKeys.operations.all, 'fleet'] as const,
    drivers: () => [...queryKeys.operations.all, 'drivers'] as const,
    guides: () => [...queryKeys.operations.all, 'guides'] as const,
    dashboard: () => [...queryKeys.operations.all, 'dashboard'] as const,
    timeline: () => [...queryKeys.operations.all, 'timeline'] as const,
  },
  finance: {
    all: ['finance'] as const,
    invoices: () => [...queryKeys.finance.all, 'invoices'] as const,
    expenses: () => [...queryKeys.finance.all, 'expenses'] as const,
    cards: () => [...queryKeys.finance.all, 'cards'] as const,
  },
  calendar: {
    all: ['calendar'] as const,
    events: () => [...queryKeys.calendar.all, 'events'] as const,
  },
  partners: {
    all: ['partners'] as const,
    list: () => [...queryKeys.partners.all, 'list'] as const,
  },
  settings: {
    all: ['settings'] as const,
    current: () => [...queryKeys.settings.all, 'current'] as const,
  },
};
