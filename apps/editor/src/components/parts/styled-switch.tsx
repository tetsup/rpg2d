import { cn } from '@editor/lib/utils';

const trackSizeClasses = {
  sm: 'h-[14px] w-[24px] after:size-3',
  default: 'h-[18.4px] w-[32px] after:size-4',
  lg: 'h-[23px] w-[40px] after:size-5',
  xl: 'h-[28px] w-[48px] after:size-6',
} as const;

type StyledSwitchSize = keyof typeof trackSizeClasses;

type StyledSwitchBaseProps = {
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

type StyledSwitchTrackProps = StyledSwitchBaseProps & {
  variant?: 'track';
  size?: StyledSwitchSize;
};

type StyledSwitchSegmentedProps = StyledSwitchBaseProps & {
  variant: 'segmented';
  labelOn?: string;
  labelOff?: string;
};

export type StyledSwitchProps = StyledSwitchTrackProps | StyledSwitchSegmentedProps;

function SwitchInput({
  id,
  checked,
  defaultChecked,
  disabled,
  onCheckedChange,
}: Pick<StyledSwitchBaseProps, 'id' | 'checked' | 'defaultChecked' | 'disabled' | 'onCheckedChange'>) {
  return (
    <input
      type="checkbox"
      role="switch"
      id={id}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
      className="peer sr-only"
    />
  );
}

function TrackSwitch({
  id,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  size = 'default',
  className,
}: StyledSwitchTrackProps) {
  return (
    <label
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer items-center',
        disabled && 'cursor-not-allowed',
        className
      )}
    >
      <SwitchInput
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
      <span
        aria-hidden="true"
        className={cn(
          'relative inline-flex shrink-0 items-center rounded-full border border-transparent bg-input transition-colors outline-none',
          'after:pointer-events-none after:block after:rounded-full after:bg-background after:transition-transform',
          'after:translate-x-0 peer-checked:after:translate-x-[calc(100%-2px)]',
          'peer-focus-visible:border-ring peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50',
          'peer-checked:bg-primary peer-disabled:opacity-50',
          'dark:bg-input/80 dark:peer-checked:bg-primary dark:peer-checked:after:bg-primary-foreground dark:after:bg-foreground',
          trackSizeClasses[size]
        )}
      />
    </label>
  );
}

const segmentButtonClassName =
  'relative z-10 flex h-full min-w-0 items-center justify-center px-2 text-sm select-none transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none';

function SegmentedSwitch({
  id,
  checked = false,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  labelOn = 'ON',
  labelOff = 'OFF',
  className,
}: StyledSwitchSegmentedProps) {
  const isChecked = checked ?? defaultChecked ?? false;

  return (
    <div
      className={cn(
        'relative grid h-10 w-full min-w-0 grid-cols-2 rounded-lg border border-input bg-muted/40 p-1',
        disabled && 'opacity-50',
        className
      )}
    >
      <SwitchInput
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-md border border-border/60 bg-background shadow-sm',
          'transition-transform duration-200 ease-out',
          isChecked ? 'translate-x-full' : 'translate-x-0'
        )}
      />
      <button
        type="button"
        disabled={disabled}
        aria-pressed={!isChecked}
        onClick={() => onCheckedChange?.(false)}
        className={cn(
          segmentButtonClassName,
          !isChecked ? 'font-medium text-foreground' : 'font-normal text-muted-foreground'
        )}
      >
        {labelOff}
      </button>
      <button
        type="button"
        disabled={disabled}
        aria-pressed={isChecked}
        onClick={() => onCheckedChange?.(true)}
        className={cn(
          segmentButtonClassName,
          isChecked ? 'font-medium text-foreground' : 'font-normal text-muted-foreground'
        )}
      >
        {labelOn}
      </button>
    </div>
  );
}

export function StyledSwitch(props: StyledSwitchProps) {
  if (props.variant === 'segmented') {
    return <SegmentedSwitch {...props} />;
  }

  return <TrackSwitch {...props} />;
}
