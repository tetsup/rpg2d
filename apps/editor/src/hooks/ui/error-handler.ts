import { ApiError } from '@editor/lib/api/error';
import { UseFormReturn } from 'react-hook-form';

export function useErrorHandler(func: () => void, form: UseFormReturn) {
  try {
    func();
  } catch (e) {
    if (e instanceof ApiError) {
    } else {
    }
  }
}
