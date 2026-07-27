import type { InputHTMLAttributes } from "react";

import type { RouteDto } from "@/modules/routes/domain";
import { difficulties } from "@/core/shared";
import { surfaceTypes } from "@/modules/routes/domain";

import { Button } from "@/components/ui/button";
import { metersToKilometersInput, secondsToDurationInput } from "@/lib/format";

interface RouteFormProps {
  action: (formData: FormData) => void | Promise<void>;
  route?: RouteDto;
  submitLabel: string;
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

export function RouteForm({ action, route, submitLabel }: RouteFormProps) {
  return (
    <form action={action} className="grid gap-7">
      <section className="grid gap-5 rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass} htmlFor="route-name">
            Name
            <input
              className={inputClass}
              id="route-name"
              name="name"
              placeholder="Neighborhood loop"
              required
              defaultValue={route?.name}
            />
          </label>

          <label className={labelClass} htmlFor="route-distance">
            Distance
            <UnitInput
              id="route-distance"
              min="0.1"
              name="distanceKm"
              placeholder="6.0"
              required
              step="0.01"
              type="number"
              unit="km"
              defaultValue={metersToKilometersInput(route?.distanceMeters)}
            />
          </label>
        </div>
      </section>

      <details className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <summary className="cursor-pointer text-sm font-semibold tracking-normal text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Advanced details
        </summary>

        <div className="mt-5 grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className={labelClass} htmlFor="route-estimated-time">
              Estimated Time
              <UnitInput
                id="route-estimated-time"
                name="estimatedDuration"
                placeholder="00:35:00"
                unit="hh:mm:ss"
                defaultValue={secondsToDurationInput(route?.estimatedDurationSeconds)}
              />
            </label>

            <label className={labelClass} htmlFor="route-elevation">
              Elevation
              <UnitInput
                id="route-elevation"
                min="1"
                name="elevationGainMeters"
                placeholder="35"
                type="number"
                unit="m"
                defaultValue={route?.elevationGainMeters ?? ""}
              />
            </label>

            <label className={labelClass} htmlFor="route-surface">
              Surface
              <select
                className={inputClass}
                id="route-surface"
                name="surfaceType"
                defaultValue={route?.surfaceType ?? "unknown"}
              >
                {surfaceTypes.map((surfaceType) => (
                  <option key={surfaceType} value={surfaceType}>
                    {surfaceType}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass} htmlFor="route-difficulty">
              Difficulty
              <select
                className={inputClass}
                id="route-difficulty"
                name="difficulty"
                defaultValue={route?.difficulty ?? "moderate"}
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className={labelClass} htmlFor="route-google-maps">
            Google Maps
            <input
              className={inputClass}
              id="route-google-maps"
              name="googleMapsUrl"
              placeholder="Paste Google Maps URL..."
              type="url"
              defaultValue={route?.googleMapsUrl ?? ""}
            />
          </label>

          <label className={labelClass} htmlFor="route-description">
            Description
            <textarea
              className={textareaClass}
              id="route-description"
              name="description"
              placeholder="What makes this route useful?"
              defaultValue={route?.description ?? ""}
            />
          </label>

          <label className={labelClass} htmlFor="route-notes">
            Notes
            <textarea
              className={textareaClass}
              id="route-notes"
              name="notes"
              placeholder="Any surface, traffic, or timing notes?"
              defaultValue={route?.notes ?? ""}
            />
          </label>

          <div className="flex flex-wrap gap-5">
            <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground">
              <input
                className="h-4 w-4"
                name="isFavorite"
                type="checkbox"
                defaultChecked={route?.isFavorite ?? false}
              />
              Favorite
            </label>
            <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground">
              <input
                className="h-4 w-4"
                name="isActive"
                type="checkbox"
                defaultChecked={route?.isActive ?? true}
              />
              Active
            </label>
          </div>
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
