"use client";

import { FormActions } from "@/components/forms/form-actions";
import { TextUnitInput } from "@/components/forms/manual-entry-inputs";
import { RequiredMark } from "@/components/ui/required-mark";
import {
  goalModules,
  goalStatuses,
  goalTypes,
  type GoalDto,
  type GoalModule,
  type GoalStatus,
  type GoalType
} from "@/modules/goals/domain";
import {
  formatDateInputValue,
  metersToKilometersInput,
  secondsToDurationInput,
  todayDateInputValue
} from "@/lib/format";

interface GoalFormProps {
  action: (formData: FormData) => void | Promise<void>;
  cancelHref: `/goals` | `/goals/${string}`;
  goal?: GoalDto;
  submitLabel: string;
}

const inputClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";

const textareaClass =
  "min-h-24 w-full rounded-md border border-input bg-background px-3 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";

const labelClass = "grid gap-2 text-sm font-medium text-muted-foreground";

const moduleLabels: Record<GoalModule, string> = {
  running: "Running",
  strength: "Strength",
  weight: "Weight",
  body_fat: "Body Fat",
  race: "Race",
  health: "Health",
  general: "General"
};

const goalTypeLabels: Record<GoalType, string> = {
  running_distance: "Running Distance",
  running_frequency: "Running Frequency",
  pace: "Pace",
  race_completion: "Race Completion",
  race_time: "Race Time",
  strength_frequency: "Strength Frequency",
  weight_target: "Weight Target",
  weight_change: "Weight Change",
  body_fat_target: "Body Fat Target",
  body_fat_change: "Body Fat Change",
  custom_health: "Custom Health",
  custom: "Custom"
};

const statusLabels: Record<GoalStatus, string> = {
  active: "Active",
  completed: "Completed",
  paused: "Paused",
  archived: "Archived"
};

function defaultPeriodEndValue() {
  const date = new Date();
  date.setMonth(date.getMonth() + 3);

  return formatDateInputValue(date);
}

export function GoalForm({ action, cancelHref, goal, submitLabel }: GoalFormProps) {
  return (
    <form action={action} className="grid gap-7">
      <section className="grid gap-5 rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass} htmlFor="goal-title">
            Title <RequiredMark />
            <input
              className={inputClass}
              id="goal-title"
              name="title"
              placeholder="Run a sub-50 10K"
              required
              defaultValue={goal?.title ?? ""}
            />
          </label>

          <label className={labelClass} htmlFor="goal-module">
            Area
            <select
              className={inputClass}
              id="goal-module"
              name="module"
              required
              defaultValue={goal?.module ?? "running"}
            >
              {goalModules.map((module) => (
                <option key={module} value={module}>
                  {moduleLabels[module]}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass} htmlFor="goal-type">
            Goal type
            <select
              className={inputClass}
              id="goal-type"
              name="goalType"
              required
              defaultValue={goal?.goalType ?? "running_distance"}
            >
              {goalTypes.map((goalType) => (
                <option key={goalType} value={goalType}>
                  {goalTypeLabels[goalType]}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass} htmlFor="goal-status">
            Status
            <select
              className={inputClass}
              id="goal-status"
              name="status"
              required
              defaultValue={goal?.status ?? "active"}
            >
              {goalStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass} htmlFor="goal-target-value">
            Target <RequiredMark />
            <TextUnitInput
              id="goal-target-value"
              inputMode="decimal"
              name="targetValue"
              placeholder="100"
              required
              unit="value"
              defaultValue={goal?.targetValue.toString() ?? ""}
            />
          </label>

          <label className={labelClass} htmlFor="goal-target-unit">
            Unit <RequiredMark />
            <input
              className={inputClass}
              id="goal-target-unit"
              name="targetUnit"
              placeholder="km, kg, %, min/km..."
              required
              defaultValue={goal?.targetUnit ?? ""}
            />
          </label>

          <label className={labelClass} htmlFor="goal-current-value">
            Current
            <TextUnitInput
              id="goal-current-value"
              inputMode="decimal"
              name="currentValue"
              placeholder="25"
              unit="value"
              defaultValue={goal?.currentValue?.toString() ?? ""}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass} htmlFor="goal-period-start">
              Start <RequiredMark />
              <input
                className={inputClass}
                id="goal-period-start"
                name="periodStart"
                required
                type="date"
                defaultValue={formatDateInputValue(goal?.periodStart) || todayDateInputValue()}
              />
            </label>

            <label className={labelClass} htmlFor="goal-period-end">
              End <RequiredMark />
              <input
                className={inputClass}
                id="goal-period-end"
                name="periodEnd"
                required
                type="date"
                defaultValue={formatDateInputValue(goal?.periodEnd) || defaultPeriodEndValue()}
              />
            </label>
          </div>
        </div>
      </section>

      <details className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <summary className="cursor-pointer text-sm font-semibold tracking-normal">
          Race details
        </summary>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <label className={labelClass} htmlFor="goal-race-date">
            Race date
            <input
              className={inputClass}
              id="goal-race-date"
              name="raceDate"
              type="date"
              defaultValue={formatDateInputValue(goal?.raceDate)}
            />
          </label>

          <label className={labelClass} htmlFor="goal-race-distance">
            Race distance
            <TextUnitInput
              id="goal-race-distance"
              inputMode="decimal"
              name="raceDistanceKilometers"
              pattern="^\\d+(?:\\.\\d{1,2})?$"
              placeholder="10.0"
              title="Use kilometers with up to 2 decimal places."
              unit="km"
              defaultValue={metersToKilometersInput(goal?.raceDistanceMeters ?? undefined)}
            />
          </label>

          <label className={labelClass} htmlFor="goal-race-time">
            Target time
            <TextUnitInput
              id="goal-race-time"
              inputMode="numeric"
              name="raceTargetTime"
              pattern="^(?:\\d+:)?[0-5]?\\d:[0-5]\\d$"
              placeholder="50:00"
              title="Use mm:ss, such as 50:00, or hh:mm:ss, such as 01:45:00."
              unit="hh:mm:ss"
              defaultValue={secondsToDurationInput(goal?.raceTargetTimeSeconds)}
            />
          </label>
        </div>
      </details>

      <label className={labelClass} htmlFor="goal-notes">
        Notes
        <textarea
          className={textareaClass}
          id="goal-notes"
          name="notes"
          placeholder="Why does this goal matter?"
          defaultValue={goal?.notes ?? ""}
        />
      </label>

      <div>
        <FormActions cancelHref={cancelHref} submitLabel={submitLabel} />
      </div>
    </form>
  );
}
