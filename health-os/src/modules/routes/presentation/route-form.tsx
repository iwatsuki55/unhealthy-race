import type { RouteDto } from "@/modules/routes/domain";
import { difficulties } from "@/core/shared";
import { surfaceTypes } from "@/modules/routes/domain";

import { FormActions } from "@/components/forms/form-actions";
import { DurationInput, QuickFillGroup, TextUnitInput } from "@/components/forms/manual-entry-inputs";
import { RequiredMark } from "@/components/ui/required-mark";
import { metersToKilometersInput, secondsToDurationInput } from "@/lib/format";

interface RouteFormProps {
  action: (formData: FormData) => void | Promise<void>;
  cancelHref: `/routes` | `/routes/${string}`;
  route?: RouteDto;
  submitLabel: string;
}

const inputClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";

const textareaClass =
  "min-h-28 w-full rounded-md border border-input bg-background px-3 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";

const labelClass = "grid gap-2 text-sm font-medium text-muted-foreground";

export function RouteForm({ action, cancelHref, route, submitLabel }: RouteFormProps) {
  return (
    <form action={action} className="grid gap-7">
      <section className="grid gap-5 rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass} htmlFor="route-name">
            Name <RequiredMark />
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
            Distance <RequiredMark />
            <TextUnitInput
              id="route-distance"
              inputMode="decimal"
              name="distanceKm"
              pattern="^\d+(\.\d{1,2})?$"
              placeholder="6.0"
              required
              title="Enter kilometers with up to 2 decimal places, such as 3.12 or 6.0."
              unit="km"
              defaultValue={metersToKilometersInput(route?.distanceMeters)}
            />
            <QuickFillGroup
              label="Route distance quick values"
              targetId="route-distance"
              options={[
                { label: "3 km", value: "3" },
                { label: "5 km", value: "5" },
                { label: "10 km", value: "10" }
              ]}
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
              <DurationInput
                id="route-estimated-time"
                name="estimatedDuration"
                placeholder="3500"
                defaultValue={secondsToDurationInput(route?.estimatedDurationSeconds)}
              />
              <QuickFillGroup
                label="Estimated time quick values"
                targetId="route-estimated-time"
                options={[
                  { label: "20 min", value: "20:00" },
                  { label: "30 min", value: "30:00" },
                  { label: "45 min", value: "45:00" },
                  { label: "60 min", value: "01:00:00" }
                ]}
              />
            </label>

            <label className={labelClass} htmlFor="route-elevation">
              Elevation
              <TextUnitInput
                id="route-elevation"
                inputMode="numeric"
                name="elevationGainMeters"
                pattern="^\d+$"
                placeholder="35"
                title="Enter elevation gain in whole meters."
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
        <FormActions cancelHref={cancelHref} submitLabel={submitLabel} />
      </div>
    </form>
  );
}
