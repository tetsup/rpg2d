import type { FieldPath, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@editor/lib/api/error';
import type { AlertDispatch } from '@editor/providers/alert';

export function useErrorHandler<T extends Record<string, unknown>>(form: UseFormReturn<T>, alert: AlertDispatch) {
  const { t } = useTranslation();
  return (func: () => void) => {
    try {
      func();
    } catch (e) {
      if (!(e instanceof ApiError)) {
        console.error(e);
        alert.error(e instanceof Error ? e.message : String(e));
        return;
      }

      switch (e.body.code) {
        case 'VALIDATION_ERROR':
          Object.entries(e.body.detail.errors.fieldErrors).forEach(([name, messages]) => {
            form.setError(name as FieldPath<T>, {
              type: 'server',
              message: messages.join('\n'),
            });
          });
          e.body.detail.errors.formErrors.forEach((message) => {
            alert.error(message);
          });
          break;

        case 'CONFLICT':
          alert.error(`${t(e.body.code)} [${e.body.detail.fields?.join(', ')}]`);
          break;

        default:
          console.error(e);
          alert.error(t(e.body.code));
          break;
      }
    }
  };
}
