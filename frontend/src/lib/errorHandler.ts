import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export function handleApiError(error: any): ApiError {
  if (error instanceof AxiosError) {
    // Axios error
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        message: data?.error || data?.message || `Request failed with status ${status}`,
        status,
        code: data?.code,
        details: data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'No response from server. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'Request failed',
        code: 'REQUEST_ERROR',
      };
    }
  } else if (error instanceof Error) {
    // Standard JavaScript error
    return {
      message: error.message,
      code: 'JAVASCRIPT_ERROR',
    };
  } else {
    // Unknown error type
    return {
      message: 'An unknown error occurred',
      code: 'UNKNOWN_ERROR',
      details: error,
    };
  }
}

export function isNetworkError(error: any): boolean {
  if (error instanceof AxiosError) {
    return !error.response && error.request;
  }
  return false;
}

export function isAuthError(error: any): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401 || error.response?.status === 403;
  }
  return false;
}

export function isServerError(error: any): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status >= 500;
  }
  return false;
}

export function isClientError(error: any): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status >= 400 && error.response?.status < 500;
  }
  return false;
}

export function getErrorMessage(error: any): string {
  const apiError = handleApiError(error);
  return apiError.message;
}

export function getErrorStatus(error: any): number | undefined {
  const apiError = handleApiError(error);
  return apiError.status;
}

export function getErrorCode(error: any): string | undefined {
  const apiError = handleApiError(error);
  return apiError.code;
}

export function logError(error: any, context?: string): void {
  const apiError = handleApiError(error);
  console.error(`[${context || 'API'}] Error:`, {
    message: apiError.message,
    status: apiError.status,
    code: apiError.code,
    details: apiError.details,
    originalError: error,
  });
}

export function createErrorToast(error: any, context?: string): string {
  const apiError = handleApiError(error);
  const message = `${context ? `${context}: ` : ''}${apiError.message}`;
  
  // You can integrate this with your toast library
  // For now, just return the message
  return message;
} 