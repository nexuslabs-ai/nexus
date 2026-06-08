import * as React from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type DatePickerPanelTimeFormat = '12-hour' | '24-hour';

type DatePickerPanelValue = {
  startDate?: Date;
  endDate?: Date;
  includeEndDate?: boolean;
  includeTime?: boolean;
  startTime?: string;
  endTime?: string;
  timeFormat?: DatePickerPanelTimeFormat;
  timeZone?: string;
};

type DatePickerPanelPreset = {
  label: string;
  getValue: (
    today: Date
  ) => Pick<DatePickerPanelValue, 'startDate' | 'endDate'>;
};

interface DatePickerPanelProps extends Omit<
  React.ComponentProps<'div'>,
  'defaultValue' | 'onChange'
> {
  /**
   * Controlled panel value.
   */
  value?: DatePickerPanelValue;
  /**
   * Initial value for uncontrolled usage.
   */
  defaultValue?: DatePickerPanelValue;
  /**
   * Called whenever the panel value changes.
   */
  onValueChange?: (value: DatePickerPanelValue) => void;
  /**
   * Reference "today" date used by the calendar and presets.
   */
  today?: Date;
  /**
   * Initial visible month.
   */
  defaultMonth?: Date;
  /**
   * First day of the week passed through to DatePicker.
   * @default 1
   */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Time option interval in minutes.
   * @default 30
   */
  timeStepMinutes?: number;
  /**
   * Optional preset chips shown below the calendar.
   */
  presets?: DatePickerPanelPreset[];
  /**
   * Consumer-owned footer rows, such as reminder/help affordances.
   */
  footer?: React.ReactNode;
}

type ActiveDateField = 'start' | 'end';

const DEFAULT_TIME = '09:00';
const DEFAULT_TIME_FORMAT: DatePickerPanelTimeFormat = '12-hour';

function cloneDate(date: Date | undefined) {
  return date ? new Date(date.getTime()) : undefined;
}

function normalizePanelValue(
  value: DatePickerPanelValue | undefined
): DatePickerPanelValue {
  return {
    startDate: cloneDate(value?.startDate),
    endDate: cloneDate(value?.endDate),
    includeEndDate: value?.includeEndDate ?? false,
    includeTime: value?.includeTime ?? false,
    startTime: value?.startTime,
    endTime: value?.endTime,
    timeFormat: value?.timeFormat ?? DEFAULT_TIME_FORMAT,
    timeZone: value?.timeZone,
  };
}

function formatDateLabel(date: Date | undefined) {
  if (!date) return 'Select date';

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatTimeLabel(
  time: string | undefined,
  timeFormat: DatePickerPanelTimeFormat
) {
  if (!time) return 'Select time';

  const [hours = '0', minutes = '0'] = time.split(':');
  const date = new Date(2000, 0, 1, Number(hours), Number(minutes));

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    hour12: timeFormat === '12-hour',
    minute: '2-digit',
  }).format(date);
}

function createTimeOptions(stepMinutes: number) {
  const step = Math.min(1440, Math.max(1, Math.floor(stepMinutes)));
  const options: string[] = [];

  for (let minutes = 0; minutes < 1440; minutes += step) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    options.push(
      `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
    );
  }

  return options;
}

function withSelectedTimeOptions(
  options: string[],
  selectedTimes: Array<string | undefined>
) {
  const merged = new Set(options);

  for (const time of selectedTimes) {
    if (time) merged.add(time);
  }

  return Array.from(merged).sort();
}

function DatePickerPanelField({
  active,
  ariaLabel,
  children,
  className,
  onClick,
}: {
  active?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-slot="date-picker-panel-field"
      data-active={active || undefined}
      aria-label={ariaLabel}
      className={cn(
        'nx:flex nx:min-h-10 nx:min-w-0 nx:flex-1 nx:items-center nx:justify-start nx:rounded-md nx:border nx:px-3 nx:py-2 nx:text-left',
        'nx:bg-background nx:text-foreground nx:typography-body-default nx:transition-colors',
        'nx:hover:bg-background-hover',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
        active
          ? 'nx:border-border-active nx:bg-primary-subtle'
          : 'nx:border-border-default',
        className
      )}
      onClick={onClick}
    >
      <span className="nx:truncate">{children}</span>
    </button>
  );
}

function DatePickerPanelTimeSelect({
  ariaLabel,
  onChange,
  options,
  timeFormat,
  value,
}: {
  ariaLabel: string;
  onChange: (value: string) => void;
  options: string[];
  timeFormat: DatePickerPanelTimeFormat;
  value: string | undefined;
}) {
  return (
    <select
      data-slot="date-picker-panel-time-select"
      aria-label={ariaLabel}
      value={value ?? DEFAULT_TIME}
      className={cn(
        'nx:min-h-10 nx:min-w-24 nx:rounded-md nx:border nx:border-border-default nx:bg-background',
        'nx:px-3 nx:py-2 nx:typography-body-default nx:text-foreground nx:transition-colors',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)'
      )}
      onChange={(event) => onChange(event.currentTarget.value)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {formatTimeLabel(option, timeFormat)}
        </option>
      ))}
    </select>
  );
}

function DatePickerPanelSwitchRow({
  checked,
  id,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  id: string;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div
      data-slot="date-picker-panel-row"
      className="nx:flex nx:min-h-10 nx:items-center nx:justify-between nx:gap-3 nx:rounded-md nx:px-2 nx:py-2"
    >
      <Label htmlFor={id} className="nx:typography-body-default nx:font-normal">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function DatePickerPanelInfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      data-slot="date-picker-panel-row"
      className="nx:flex nx:min-h-10 nx:items-center nx:justify-between nx:gap-3 nx:rounded-md nx:px-2 nx:py-2"
    >
      <span className="nx:typography-body-default nx:text-foreground">
        {label}
      </span>
      <span className="nx:min-w-0 nx:truncate nx:text-right nx:typography-body-default nx:text-muted-foreground">
        {value}
      </span>
    </div>
  );
}

function DatePickerPanel({
  className,
  defaultMonth,
  defaultValue,
  footer,
  onValueChange,
  presets,
  timeStepMinutes = 30,
  today,
  value,
  weekStartsOn = 1,
  ...props
}: DatePickerPanelProps) {
  const [fallbackToday] = React.useState(() => new Date());
  const [activeField, setActiveField] =
    React.useState<ActiveDateField>('start');
  const [resolvedTimeZone, setResolvedTimeZone] = React.useState<string>();
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState<DatePickerPanelValue>(() =>
      normalizePanelValue(defaultValue)
    );
  const endDateId = React.useId();
  const includeTimeId = React.useId();

  const isControlled = value !== undefined;
  const currentValue = normalizePanelValue(
    isControlled ? value : uncontrolledValue
  );
  const actualToday = today ?? fallbackToday;
  const timeFormat = currentValue.timeFormat ?? DEFAULT_TIME_FORMAT;
  const includeEndDate = currentValue.includeEndDate ?? false;
  const includeTime = currentValue.includeTime ?? false;
  const timeZoneLabel =
    currentValue.timeZone ?? resolvedTimeZone ?? 'Local time';

  const timeOptions = React.useMemo(
    () =>
      withSelectedTimeOptions(createTimeOptions(timeStepMinutes), [
        currentValue.startTime,
        currentValue.endTime,
      ]),
    [currentValue.endTime, currentValue.startTime, timeStepMinutes]
  );

  React.useEffect(() => {
    if (currentValue.timeZone || resolvedTimeZone) return;
    setResolvedTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, [currentValue.timeZone, resolvedTimeZone]);

  function commitValue(nextValue: DatePickerPanelValue) {
    const normalizedValue = normalizePanelValue(nextValue);

    if (!isControlled) {
      setUncontrolledValue(normalizedValue);
    }

    onValueChange?.(normalizedValue);
  }

  function updateValue(patch: DatePickerPanelValue) {
    commitValue({
      ...currentValue,
      ...patch,
    });
  }

  function handleSingleSelect(selectedDate: Date | undefined) {
    updateValue({ startDate: selectedDate });
  }

  function handleRangeSelect(range: DateRange | undefined) {
    updateValue({
      startDate: range?.from,
      endDate: range?.to,
    });
  }

  function handleEndDateChange(checked: boolean) {
    if (checked) {
      commitValue({
        ...currentValue,
        includeEndDate: true,
        endDate: currentValue.endDate ?? currentValue.startDate,
      });
      setActiveField('end');
      return;
    }

    commitValue({
      ...currentValue,
      includeEndDate: false,
      endDate: undefined,
    });
    setActiveField('start');
  }

  function handleIncludeTimeChange(checked: boolean) {
    commitValue({
      ...currentValue,
      includeTime: checked,
      startTime: checked
        ? (currentValue.startTime ?? DEFAULT_TIME)
        : currentValue.startTime,
      endTime: checked
        ? (currentValue.endTime ?? DEFAULT_TIME)
        : currentValue.endTime,
    });
  }

  function handlePresetClick(preset: DatePickerPanelPreset) {
    const presetValue = preset.getValue(actualToday);

    commitValue({
      ...currentValue,
      startDate: presetValue.startDate,
      endDate: presetValue.endDate,
      includeEndDate: Boolean(presetValue.endDate) || includeEndDate,
    });
  }

  function handleClear() {
    commitValue({
      includeEndDate: false,
      includeTime: false,
      timeFormat: DEFAULT_TIME_FORMAT,
      timeZone: currentValue.timeZone,
    });
    setActiveField('start');
  }

  const selectedRange: DateRange | undefined =
    currentValue.startDate || currentValue.endDate
      ? { from: currentValue.startDate, to: currentValue.endDate }
      : undefined;

  return (
    <div
      data-slot="date-picker-panel"
      data-include-end-date={includeEndDate || undefined}
      data-include-time={includeTime || undefined}
      className={cn(
        'nx:[--date-picker-panel-cell-size:var(--nx-spacing-8)]',
        'nx:[--date-picker-panel-grid-width:calc(var(--date-picker-panel-cell-size)_+_var(--date-picker-panel-cell-size)_+_var(--date-picker-panel-cell-size)_+_var(--date-picker-panel-cell-size)_+_var(--date-picker-panel-cell-size)_+_var(--date-picker-panel-cell-size)_+_var(--date-picker-panel-cell-size))]',
        'nx:inline-flex nx:w-fit nx:flex-col nx:gap-3.5 nx:rounded-md nx:border nx:border-border-default nx:bg-popover nx:p-3.5 nx:text-popover-foreground nx:shadow-lg',
        className
      )}
      {...props}
    >
      <div className="nx:flex nx:w-[var(--date-picker-panel-grid-width)] nx:flex-col nx:gap-3">
        {!includeTime ? (
          <div className="nx:flex nx:gap-2">
            <DatePickerPanelField
              active={activeField === 'start'}
              ariaLabel="Start date"
              onClick={() => setActiveField('start')}
            >
              {formatDateLabel(currentValue.startDate)}
            </DatePickerPanelField>
            {includeEndDate ? (
              <DatePickerPanelField
                active={activeField === 'end'}
                ariaLabel="End date"
                onClick={() => setActiveField('end')}
              >
                {formatDateLabel(currentValue.endDate)}
              </DatePickerPanelField>
            ) : null}
          </div>
        ) : (
          <div className="nx:flex nx:flex-col nx:gap-2">
            <div className="nx:flex nx:gap-2">
              <DatePickerPanelField
                active={activeField === 'start'}
                ariaLabel="Start date"
                onClick={() => setActiveField('start')}
              >
                {formatDateLabel(currentValue.startDate)}
              </DatePickerPanelField>
              <DatePickerPanelTimeSelect
                ariaLabel="Start time"
                options={timeOptions}
                timeFormat={timeFormat}
                value={currentValue.startTime ?? DEFAULT_TIME}
                onChange={(nextTime) => updateValue({ startTime: nextTime })}
              />
            </div>
            {includeEndDate ? (
              <div className="nx:flex nx:gap-2">
                <DatePickerPanelField
                  active={activeField === 'end'}
                  ariaLabel="End date"
                  onClick={() => setActiveField('end')}
                >
                  {formatDateLabel(currentValue.endDate)}
                </DatePickerPanelField>
                <DatePickerPanelTimeSelect
                  ariaLabel="End time"
                  options={timeOptions}
                  timeFormat={timeFormat}
                  value={currentValue.endTime ?? DEFAULT_TIME}
                  onChange={(nextTime) => updateValue({ endTime: nextTime })}
                />
              </div>
            ) : null}
          </div>
        )}

        {includeEndDate ? (
          <DatePicker
            mode="range"
            selected={selectedRange}
            onSelect={handleRangeSelect}
            defaultMonth={
              defaultMonth ?? currentValue.startDate ?? currentValue.endDate
            }
            today={actualToday}
            weekStartsOn={weekStartsOn}
            className="nx:p-0"
          />
        ) : (
          <DatePicker
            mode="single"
            selected={currentValue.startDate}
            onSelect={handleSingleSelect}
            defaultMonth={defaultMonth ?? currentValue.startDate}
            today={actualToday}
            weekStartsOn={weekStartsOn}
            className="nx:p-0"
          />
        )}

        {presets?.length ? (
          <>
            <Separator />
            <div
              data-slot="date-picker-panel-presets"
              className="nx:flex nx:flex-wrap nx:gap-2"
            >
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </>
        ) : null}

        <Separator />

        <div
          data-slot="date-picker-panel-settings"
          className="nx:flex nx:flex-col nx:gap-1"
        >
          <DatePickerPanelSwitchRow
            id={`${endDateId}-end-date`}
            label="End date"
            checked={includeEndDate}
            onCheckedChange={handleEndDateChange}
          />
          <DatePickerPanelSwitchRow
            id={`${includeTimeId}-include-time`}
            label="Include time"
            checked={includeTime}
            onCheckedChange={handleIncludeTimeChange}
          />
          {includeTime ? (
            <>
              <div
                data-slot="date-picker-panel-row"
                className="nx:flex nx:min-h-10 nx:items-center nx:justify-between nx:gap-3 nx:rounded-md nx:px-2 nx:py-2"
              >
                <span className="nx:typography-body-default nx:text-foreground">
                  Time format
                </span>
                <div
                  data-slot="date-picker-panel-time-format"
                  className="nx:flex nx:rounded-md nx:border nx:border-border-default nx:bg-control-background nx:p-0.5"
                >
                  {(['12-hour', '24-hour'] as const).map((format) => (
                    <button
                      key={format}
                      type="button"
                      aria-pressed={timeFormat === format}
                      className={cn(
                        'nx:rounded-sm nx:px-2 nx:py-1 nx:typography-label-small nx:text-muted-foreground nx:transition-colors',
                        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
                        timeFormat === format &&
                          'nx:bg-background nx:text-foreground'
                      )}
                      onClick={() => updateValue({ timeFormat: format })}
                    >
                      {format === '12-hour' ? '12 hour' : '24 hour'}
                    </button>
                  ))}
                </div>
              </div>
              <DatePickerPanelInfoRow label="Timezone" value={timeZoneLabel} />
            </>
          ) : null}
        </div>

        <Separator />

        <button
          type="button"
          data-slot="date-picker-panel-clear"
          className={cn(
            'nx:flex nx:min-h-10 nx:w-full nx:items-center nx:rounded-md nx:px-2 nx:py-2 nx:text-left',
            'nx:typography-body-default nx:text-foreground nx:transition-colors nx:hover:bg-popover-hover',
            'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)'
          )}
          onClick={handleClear}
        >
          Clear
        </button>

        {footer ? (
          <>
            <Separator />
            <div data-slot="date-picker-panel-footer">{footer}</div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export {
  DatePickerPanel,
  type DatePickerPanelPreset,
  type DatePickerPanelProps,
  type DatePickerPanelValue,
};
