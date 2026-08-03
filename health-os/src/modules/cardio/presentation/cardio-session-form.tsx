"use client";

import { useState } from "react";

import type { RouteDto } from "@/modules/routes/domain";
import type { CardioActivityType, CardioSessionDto } from "@/modules/cardio/domain";
import {
  cardioActivityTypeValues,
  getCardioActivityConfig,
  getCardioActivityLabel
} from "@/modules/cardio/domain";

import { FormActions } from "@/components/forms/form-actions";
import {
  DurationInput,
  PacePreview,
  QuickFillGroup,
  TextUnitInput
} from "@/components/forms/manual-entry-inputs";
import { RequiredMark } from "@/components/ui/required-mark";
import {
  formatDateInputValue,
  metersToKilometersInput,
  secondsToDurationInput
} from "@/lib/format";

interface CardioSessionFormProps {
  action: (formData: FormData) => void | Promise<void>;
  cancelHref: `/cardio` | `/cardio/${string}`;
  routes: RouteDto[];
  session?: CardioSessionDto;
  submitLabel: string;
}

function toDateTimeLocalValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 16) : "";
}

const inputClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";

const textareaClass =
  "min-h-28 w-full rounded-md border border-input bg-background px-3 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";

const labelClass = "grid gap-2 text-sm font-medium text-muted-foreground";

export function CardioSessionForm({
  action,
  cancelHref,
  routes,
  session,
  submitLabel
}: CardioSessionFormProps) {
  const [activityType, setActivityType] = useState<CardioActivityType>(
    session?.activityType ?? "outdoor_run"
  );
  const config = getCardioActivityConfig(activityType);

  return (
    <form action={action} className="grid gap-7">
      <section className="grid gap-5 rounded-lg border border-border bg-card p-4 sm:p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Activity Type <RequiredMark />
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {cardioActivityTypeValues.map((value) => (
              <label
                className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                key={value}
              >
                <input
                  checked={activityType === value}
                  className="h-4 w-4 accent-primary"
                  name="activityType"
                  onChange={() => setActivityType(value)}
                  type="radio"
                  value={value}
                />
                {getCardioActivityLabel(value)}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass} htmlFor="cardio-date">
            Date <RequiredMark />
            <input
              className={inputClass}
              id="cardio-date"
              name="runDate"
              required
              type="date"
              defaultValue={formatDateInputValue(session?.runDate)}
            />
          </label>

          {config.supportsDistance ? (
            <label className={labelClass} htmlFor="cardio-distance">
              Distance {config.requiresDistance ? <RequiredMark /> : null}
              <TextUnitInput
                id="cardio-distance"
                inputMode="decimal"
                name="distanceKm"
                pattern="^\d+(\.\d{1,2})?$"
                placeholder="6.0"
                required={config.requiresDistance}
                title="Enter kilometers with up to 2 decimal places, such as 3.12 or 6.0."
                unit="km"
                defaultValue={metersToKilometersInput(session?.distanceMeters ?? undefined)}
              />
              <QuickFillGroup
                label="Cardio distance quick values"
                targetId="cardio-distance"
                options={[
                  { label: "3 km", value: "3" },
                  { label: "5 km", value: "5" },
                  { label: "10 km", value: "10" }
                ]}
              />
            </label>
          ) : null}

          <label className={labelClass} htmlFor="cardio-duration">
            Duration <RequiredMark />
            <DurationInput
              id="cardio-duration"
              name="duration"
              placeholder="3500"
              required
              defaultValue={secondsToDurationInput(session?.durationSeconds)}
            />
            <QuickFillGroup
              label="Cardio duration quick values"
              targetId="cardio-duration"
              options={[
                { label: "20 min", value: "20:00" },
                { label: "30 min", value: "30:00" },
                { label: "45 min", value: "45:00" },
                { label: "60 min", value: "01:00:00" }
              ]}
            />
          </label>

          {config.supportsRoute ? (
            <label className={labelClass} htmlFor="cardio-route">
              Route
              <select
                className={inputClass}
                id="cardio-route"
                name="routeId"
                defaultValue={session?.routeId ?? ""}
              >
                <option value="">No route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        {config.supportsDistance && config.showsPace ? (
          <PacePreview distanceInputId="cardio-distance" durationInputId="cardio-duration" />
        ) : null}
      </section>

      <details className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <summary className="cursor-pointer text-sm font-semibold tracking-normal text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Advanced details
        </summary>

        <div className="mt-5 grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className={labelClass} htmlFor="cardio-started-at">
              Start time
              <input
                className={inputClass}
                id="cardio-started-at"
                name="startedAt"
                type="datetime-local"
                defaultValue={toDateTimeLocalValue(session?.startedAt)}
              />
            </label>

            <label className={labelClass} htmlFor="cardio-avg-hr">
              Avg HR
              <TextUnitInput
                id="cardio-avg-hr"
                inputMode="numeric"
                name="averageHeartRate"
                pattern="^\d+$"
                placeholder="142"
                title="Enter average heart rate in bpm."
                unit="bpm"
                defaultValue={session?.averageHeartRate ?? ""}
              />
            </label>

            <label className={labelClass} htmlFor="cardio-max-hr">
              Max HR
              <TextUnitInput
                id="cardio-max-hr"
                inputMode="numeric"
                name="maximumHeartRate"
                pattern="^\d+$"
                placeholder="171"
                title="Enter maximum heart rate in bpm."
                unit="bpm"
                defaultValue={session?.maximumHeartRate ?? ""}
              />
            </label>

            {config.supportsCadence ? (
              <label className={labelClass} htmlFor="cardio-cadence">
                Cadence
                <TextUnitInput
                  id="cardio-cadence"
                  inputMode="numeric"
                  name="cadenceStepsPerMinute"
                  pattern="^\d+$"
                  placeholder="176"
                  title="Enter cadence as steps per minute."
                  unit="spm"
                  defaultValue={session?.cadenceStepsPerMinute ?? ""}
                />
              </label>
            ) : null}

            <label className={labelClass} htmlFor="cardio-calories">
              Calories
              <TextUnitInput
                id="cardio-calories"
                inputMode="numeric"
                name="calories"
                pattern="^\d+$"
                placeholder="430"
                title="Enter calories in kcal."
                unit="kcal"
                defaultValue={session?.calories ?? ""}
              />
            </label>

            <label className={labelClass} htmlFor="cardio-temperature">
              Temperature
              <TextUnitInput
                id="cardio-temperature"
                inputMode="decimal"
                name="temperatureCelsius"
                pattern="^-?\d+(\.\d+)?$"
                placeholder="28"
                title="Enter temperature in Celsius."
                unit="°C"
                defaultValue={session?.temperatureCelsius ?? ""}
              />
            </label>

            <label className={labelClass} htmlFor="cardio-humidity">
              Humidity
              <TextUnitInput
                id="cardio-humidity"
                inputMode="numeric"
                name="humidityPercent"
                pattern="^(100|[1-9]?\d)$"
                placeholder="65"
                title="Enter humidity from 0 to 100."
                unit="%"
                defaultValue={session?.humidityPercent ?? ""}
              />
            </label>

            <label className={labelClass} htmlFor="cardio-rpe">
              RPE
              <input
                className={inputClass}
                id="cardio-rpe"
                inputMode="numeric"
                name="perceivedEffort"
                pattern="^([1-9]|10)$"
                placeholder="6"
                title="Enter RPE from 1 to 10."
                type="text"
                defaultValue={session?.perceivedEffort ?? ""}
              />
            </label>
          </div>

          <label className={labelClass} htmlFor="cardio-shoes">
            Shoes
            <input
              className={inputClass}
              id="cardio-shoes"
              name="shoes"
              placeholder="Nike Pegasus 41"
              defaultValue={session?.shoes ?? ""}
            />
          </label>

          <label className={labelClass} htmlFor="cardio-screenshot">
            Screenshot
            <input
              className={inputClass}
              id="cardio-screenshot"
              name="screenshotAttachmentRef"
              placeholder="Paste screenshot reference..."
              defaultValue={session?.screenshotAttachmentRef ?? ""}
            />
          </label>

          <label className={labelClass} htmlFor="cardio-notes">
            Notes
            <textarea
              className={textareaClass}
              id="cardio-notes"
              name="notes"
              placeholder="How did today's cardio feel?"
              defaultValue={session?.notes ?? ""}
            />
          </label>
        </div>
      </details>

      <div>
        <FormActions cancelHref={cancelHref} submitLabel={submitLabel} />
      </div>
    </form>
  );
}

export const RunForm = CardioSessionForm;
