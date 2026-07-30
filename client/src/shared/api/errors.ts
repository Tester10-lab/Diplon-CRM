export interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof Error) {
    return { message: error.message };
  }
  if (typeof error === 'string') {
    return { message: error };
  }
  return { message: 'An unknown API error occurred.' };
}
