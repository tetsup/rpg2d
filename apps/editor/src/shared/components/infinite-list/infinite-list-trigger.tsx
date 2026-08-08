import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export type InfiniteListTriggerProps = {
  enabled?: boolean;
  onTrigger(): void;
};

export function InfiniteListTrigger({ enabled = true, onTrigger }: InfiniteListTriggerProps) {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (enabled && inView) {
      onTrigger();
    }
  }, [enabled, inView, onTrigger]);

  return <div ref={ref} />;
}
