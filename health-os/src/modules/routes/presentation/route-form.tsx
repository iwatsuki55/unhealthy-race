import type { RouteDto } from "@/modules/routes/domain";
import { difficulties } from "@/core/shared";
import { surfaceTypes } from "@/modules/routes/domain";

import { Button } from "@/components/ui/button";

interface RouteFormProps {
  action: (formData: FormData) => void | Promise<void>;
  route?: RouteDto;
  submitLabel: string;
}

export function RouteForm({ action, route, submitLabel }: RouteFormProps) {
  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Name
          <input
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            name="name"
            required
            defaultValue={route?.name}
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
            defaultValue={route?.distanceMeters}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Estimated duration seconds
          <input
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            min="1"
            name="estimatedDurationSeconds"
            type="number"
            defaultValue={route?.estimatedDurationSeconds ?? ""}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Elevation gain meters
          <input
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            min="1"
            name="elevationGainMeters"
            type="number"
            defaultValue={route?.elevationGainMeters ?? ""}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Surface
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
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

        <label className="grid gap-2 text-sm font-medium">
          Difficulty
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
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

      <label className="grid gap-2 text-sm font-medium">
        Google Maps URL
        <input
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          name="googleMapsUrl"
          type="url"
          defaultValue={route?.googleMapsUrl ?? ""}
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Description
        <textarea
          className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
          name="description"
          defaultValue={route?.description ?? ""}
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Notes
        <textarea
          className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
          name="notes"
          defaultValue={route?.notes ?? ""}
        />
      </label>

      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <input name="isFavorite" type="checkbox" defaultChecked={route?.isFavorite ?? false} />
          Favorite
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <input name="isActive" type="checkbox" defaultChecked={route?.isActive ?? true} />
          Active
        </label>
      </div>

      <div>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
