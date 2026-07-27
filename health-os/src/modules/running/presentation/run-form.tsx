import type { RouteDto } from "@/modules/routes/domain";
import type { RunDto } from "@/modules/running/domain";

import { Button } from "@/components/ui/button";

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

export function RunForm({ action, routes, run, submitLabel }: RunFormProps) {
  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Date
          <input
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            name="runDate"
            required
            type="date"
            defaultValue={toDateInputValue(run?.runDate)}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Start time
          <input
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            name="startedAt"
            type="datetime-local"
            defaultValue={toDateTimeLocalValue(run?.startedAt)}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Distance meters
          <input
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            min="1"
            name="distanceMeters"
            required
            type="number"
            defaultValue={run?.distanceMeters}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Duration seconds
          <input
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            min="1"
            name="durationSeconds"
            required
            type="number"
            defaultValue={run?.durationSeconds}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Route
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
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

        <label className="grid gap-2 text-sm font-medium">
          Perceived effort
          <input
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            max="10"
            min="1"
            name="perceivedEffort"
            type="number"
            defaultValue={run?.perceivedEffort ?? ""}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Average heart rate
          <input
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            min="1"
            name="averageHeartRate"
            type="number"
            defaultValue={run?.averageHeartRate ?? ""}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Maximum heart rate
          <input
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            min="1"
            name="maximumHeartRate"
            type="number"
            defaultValue={run?.maximumHeartRate ?? ""}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Cadence
          <input
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            min="1"
            name="cadenceStepsPerMinute"
            type="number"
            defaultValue={run?.cadenceStepsPerMinute ?? ""}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Calories
          <input
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            min="1"
            name="calories"
            type="number"
            defaultValue={run?.calories ?? ""}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Temperature Celsius
          <input
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            name="temperatureCelsius"
            step="0.1"
            type="number"
            defaultValue={run?.temperatureCelsius ?? ""}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Humidity percent
          <input
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            max="100"
            min="0"
            name="humidityPercent"
            type="number"
            defaultValue={run?.humidityPercent ?? ""}
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Shoes
        <input
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          name="shoes"
          defaultValue={run?.shoes ?? ""}
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Screenshot attachment reference
        <input
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          name="screenshotAttachmentRef"
          defaultValue={run?.screenshotAttachmentRef ?? ""}
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Notes
        <textarea
          className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
          name="notes"
          defaultValue={run?.notes ?? ""}
        />
      </label>

      <div>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
