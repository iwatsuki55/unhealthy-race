import type { RouteDto } from "@/modules/routes/domain";
import type { RunDto } from "@/modules/running/domain";

import { FormActions } from "@/components/forms/form-actions";
import { PacePreview, QuickFillGroup, TextUnitInput } from "@/components/forms/manual-entry-inputs";
import { RequiredMark } from "@/components/ui/required-mark";
import {
  formatDateInputValue,
  metersToKilometersInput,
  secondsToDurationInput
} from "@/lib/format";

interface RunFormProps {
  action: (formData: FormData) => void | Promise<void>;
  cancelHref: `/running` | `/running/${string}`;
  routes: RouteDto[];
  run?: RunDto;
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

export function RunForm({ action, cancelHref, routes, run, submitLabel }: RunFormProps) {
  return (
    <form action={action} className="grid gap-7">
      <section className="grid gap-5 rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass} htmlFor="run-date">
            Date <RequiredMark />
            <input
              className={inputClass}
              id="run-date"
              name="runDate"
              required
              type="date"
              defaultValue={formatDateInputValue(run?.runDate)}
            />
          </label>

          <label className={labelClass} htmlFor="run-distance">
            Distance <RequiredMark />
            <TextUnitInput
              id="run-distance"
              inputMode="decimal"
              name="distanceKm"
              pattern="^\d+(\.\d{1,2})?$"
              placeholder="6.0"
              required
              title="Enter kilometers with up to 2 decimal places, such as 3.12 or 6.0."
              unit="km"
              defaultValue={metersToKilometersInput(run?.distanceMeters)}
            />
            <QuickFillGroup
              label="Running distance quick values"
              targetId="run-distance"
              options={[
                { label: "3 km", value: "3" },
                { label: "5 km", value: "5" },
                { label: "10 km", value: "10" }
              ]}
            />
          </label>

          <label className={labelClass} htmlFor="run-duration">
            Duration <RequiredMark />
            <TextUnitInput
              id="run-duration"
              inputMode="numeric"
              name="duration"
              pattern="^(?:\d+:)?[0-5]?\d:[0-5]\d$"
              placeholder="35:00"
              required
              title="Use mm:ss, such as 35:00, or hh:mm:ss, such as 01:05:30."
              unit="hh:mm:ss"
              defaultValue={secondsToDurationInput(run?.durationSeconds)}
            />
            <QuickFillGroup
              label="Running duration quick values"
              targetId="run-duration"
              options={[
                { label: "20 min", value: "20:00" },
                { label: "30 min", value: "30:00" },
                { label: "45 min", value: "45:00" },
                { label: "60 min", value: "01:00:00" }
              ]}
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

        <PacePreview distanceInputId="run-distance" durationInputId="run-duration" />
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
              <TextUnitInput
                id="run-avg-hr"
                inputMode="numeric"
                name="averageHeartRate"
                pattern="^\d+$"
                placeholder="142"
                title="Enter average heart rate in bpm."
                unit="bpm"
                defaultValue={run?.averageHeartRate ?? ""}
              />
            </label>

            <label className={labelClass} htmlFor="run-max-hr">
              Max HR
              <TextUnitInput
                id="run-max-hr"
                inputMode="numeric"
                name="maximumHeartRate"
                pattern="^\d+$"
                placeholder="171"
                title="Enter maximum heart rate in bpm."
                unit="bpm"
                defaultValue={run?.maximumHeartRate ?? ""}
              />
            </label>

            <label className={labelClass} htmlFor="run-cadence">
              Cadence
              <TextUnitInput
                id="run-cadence"
                inputMode="numeric"
                name="cadenceStepsPerMinute"
                pattern="^\d+$"
                placeholder="176"
                title="Enter cadence as steps per minute."
                unit="spm"
                defaultValue={run?.cadenceStepsPerMinute ?? ""}
              />
            </label>

            <label className={labelClass} htmlFor="run-calories">
              Calories
              <TextUnitInput
                id="run-calories"
                inputMode="numeric"
                name="calories"
                pattern="^\d+$"
                placeholder="430"
                title="Enter calories in kcal."
                unit="kcal"
                defaultValue={run?.calories ?? ""}
              />
            </label>

            <label className={labelClass} htmlFor="run-temperature">
              Temperature
              <TextUnitInput
                id="run-temperature"
                inputMode="decimal"
                name="temperatureCelsius"
                pattern="^-?\d+(\.\d+)?$"
                placeholder="28"
                title="Enter temperature in Celsius."
                unit="°C"
                defaultValue={run?.temperatureCelsius ?? ""}
              />
            </label>

            <label className={labelClass} htmlFor="run-humidity">
              Humidity
              <TextUnitInput
                id="run-humidity"
                inputMode="numeric"
                name="humidityPercent"
                pattern="^(100|[1-9]?\d)$"
                placeholder="65"
                title="Enter humidity from 0 to 100."
                unit="%"
                defaultValue={run?.humidityPercent ?? ""}
              />
            </label>

            <label className={labelClass} htmlFor="run-rpe">
              RPE
              <input
                className={inputClass}
                id="run-rpe"
                inputMode="numeric"
                name="perceivedEffort"
                pattern="^([1-9]|10)$"
                placeholder="6"
                title="Enter RPE from 1 to 10."
                type="text"
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
        <FormActions cancelHref={cancelHref} submitLabel={submitLabel} />
      </div>
    </form>
  );
}
