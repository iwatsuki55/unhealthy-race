import type { InputHTMLAttributes } from "react";

import type { RouteDto } from "@/modules/routes/domain";
import type { RunDto } from "@/modules/running/domain";

import { Button } from "@/components/ui/button";
import { metersToKilometersInput, secondsToDurationInput } from "@/lib/format";

interface RunFormProps {
  action: (formData: FormData) => void | Promise<void>;
  routes: RouteDto[];
  run?: RunDto;
  submitLabel: string;
}

function toDateInputValue(date: Date | undefined) {
  return date ? date.toISOString().slice(0, 10) : "";
}

function toDateTimeLocalValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 16) : "";
}

const inputClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";

const textareaClass =
  "min-h-28 w-full rounded-md border border-input bg-background px-3 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";

const labelClass = "grid gap-2 text-sm font-medium text-muted-foreground";

function UnitInput({
  id,
  name,
  unit,
  type = "text",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  name: string;
  unit: string;
}) {
  return (
    <div className="flex min-h-11 rounded-md border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-ring">
      <input
        {...props}
        className="min-w-0 flex-1 rounded-l-md bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
        id={id}
        name={name}
        type={type}
      />
      <span className="inline-flex items-center border-l border-border px-3 text-sm text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}

export function RunForm({ action, routes, run, submitLabel }: RunFormProps) {
  return (
    <form action={action} className="grid gap-7">
      <section className="grid gap-5 rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass} htmlFor="run-date">
            Date
            <input
              className={inputClass}
              id="run-date"
              name="runDate"
              required
              type="date"
              defaultValue={toDateInputValue(run?.runDate)}
            />
          </label>

          <label className={labelClass} htmlFor="run-distance">
            Distance
            <UnitInput
              id="run-distance"
              min="0.1"
              name="distanceKm"
              placeholder="6.0"
              required
              step="0.01"
              type="number"
              unit="km"
              defaultValue={metersToKilometersInput(run?.distanceMeters)}
            />
          </label>

          <label className={labelClass} htmlFor="run-duration">
            Duration
            <UnitInput
              id="run-duration"
              name="duration"
              placeholder="00:35:00"
              required
              unit="hh:mm:ss"
              defaultValue={secondsToDurationInput(run?.durationSeconds)}
            />
          </label>

          <label className={labelClass} htmlFor="run-route">
            Route
            <select
              className={inputClass}
              id="run-route"
              name="routeId"
              defaultValue={run?.routeId ?? ""}
            >
              <option value="">No route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <details className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <summary className="cursor-pointer text-sm font-semibold tracking-normal text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Advanced details
        </summary>

        <div className="mt-5 grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className={labelClass} htmlFor="run-started-at">
              Start time
              <input
                className={inputClass}
                id="run-started-at"
                name="startedAt"
                type="datetime-local"
                defaultValue={toDateTimeLocalValue(run?.startedAt)}
              />
            </label>

            <label className={labelClass} htmlFor="run-avg-hr">
              Avg HR
              <UnitInput
                id="run-avg-hr"
                min="1"
                name="averageHeartRate"
                placeholder="142"
                type="number"
                unit="bpm"
                defaultValue={run?.averageHeartRate ?? ""}
              />
            </label>

            <label className={labelClass} htmlFor="run-max-hr">
              Max HR
              <UnitInput
                id="run-max-hr"
                min="1"
                name="maximumHeartRate"
                placeholder="171"
                type="number"
                unit="bpm"
                defaultValue={run?.maximumHeartRate ?? ""}
              />
            </label>

            <label className={labelClass} htmlFor="run-cadence">
              Cadence
              <UnitInput
                id="run-cadence"
                min="1"
                name="cadenceStepsPerMinute"
                placeholder="176"
                type="number"
                unit="spm"
                defaultValue={run?.cadenceStepsPerMinute ?? ""}
              />
            </label>

            <label className={labelClass} htmlFor="run-calories">
              Calories
              <UnitInput
                id="run-calories"
                min="1"
                name="calories"
                placeholder="430"
                type="number"
                unit="kcal"
                defaultValue={run?.calories ?? ""}
              />
            </label>

            <label className={labelClass} htmlFor="run-temperature">
              Temperature
              <UnitInput
                id="run-temperature"
                name="temperatureCelsius"
                placeholder="28"
                step="0.1"
                type="number"
                unit="°C"
                defaultValue={run?.temperatureCelsius ?? ""}
              />
            </label>

            <label className={labelClass} htmlFor="run-humidity">
              Humidity
              <UnitInput
                id="run-humidity"
                max="100"
                min="0"
                name="humidityPercent"
                placeholder="65"
                type="number"
                unit="%"
                defaultValue={run?.humidityPercent ?? ""}
              />
            </label>

            <label className={labelClass} htmlFor="run-rpe">
              RPE
              <input
                className={inputClass}
                id="run-rpe"
                max="10"
                min="1"
                name="perceivedEffort"
                placeholder="6"
                type="number"
                defaultValue={run?.perceivedEffort ?? ""}
              />
            </label>
          </div>

          <label className={labelClass} htmlFor="run-shoes">
            Shoes
            <input
              className={inputClass}
              id="run-shoes"
              name="shoes"
              placeholder="Nike Pegasus 41"
              defaultValue={run?.shoes ?? ""}
            />
          </label>

          <label className={labelClass} htmlFor="run-screenshot">
            Screenshot
            <input
              className={inputClass}
              id="run-screenshot"
              name="screenshotAttachmentRef"
              placeholder="Paste screenshot reference..."
              defaultValue={run?.screenshotAttachmentRef ?? ""}
            />
          </label>

          <label className={labelClass} htmlFor="run-notes">
            Notes
            <textarea
              className={textareaClass}
              id="run-notes"
              name="notes"
              placeholder="How did today's run feel?"
              defaultValue={run?.notes ?? ""}
            />
          </label>
        </div>
      </details>

      <div>
        <Button className="h-11 px-5" type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
