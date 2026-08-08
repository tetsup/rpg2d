import { AlertBanner } from '@base/components/feedback/alert-banner';
import { AlertStack } from '@base/components/feedback/alert-stack';

import { useAlert, useAlertState } from '@editor/shared/providers/alert';

export function AlertViewport() {
  const { alerts } = useAlertState();
  const alert = useAlert();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <AlertStack>
      {alerts.map((item) => (
        <AlertBanner key={item.id} level={item.level} onClose={() => alert.remove(item.id)}>
          {item.message}
        </AlertBanner>
      ))}
    </AlertStack>
  );
}
