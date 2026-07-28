"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { FormActions } from "@/components/forms/form-actions";
import { SplitDurationInput, TextUnitInput } from "@/components/forms/manual-entry-inputs";
import { Button } from "@/components/ui/button";
import { RequiredMark } from "@/components/ui/required-mark";
import { formatDateInputValue, secondsToDurationInput } from "@/lib/format";
import type { StrengthSessionDto } from "@/modules/strength/domain";
import { equipmentTypes, workoutTypes } from "@/modules/strength/domain";

interface StrengthSessionFormProps {
  action: (formData: FormData) => void | Promise<void>;
  cancelHref: `/strength` | `/strength/${string}`;
  session?: StrengthSessionDto;
  submitLabel: string;
}

interface DraftSet {
  reps: string;
  weightValue: string;
  weightUnit: "kg" | "lb";
  restSeconds: string;
  perceivedEffort: string;
  notes: string;
}

interface DraftExercise {
  exerciseName: string;
  equipmentType: (typeof equipmentTypes)[number];
  notes: string;
  sets: DraftSet[];
}

const inputClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";

const textareaClass =
  "min-h-24 w-full rounded-md border border-input bg-background px-3 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";

const labelClass = "grid gap-2 text-sm font-medium text-muted-foreground";

function toDateTimeLocalValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 16) : "";
}

function createEmptySet(): DraftSet {
  return {
    reps: "",
    weightValue: "",
    weightUnit: "kg",
    restSeconds: "",
    perceivedEffort: "",
    notes: ""
  };
}

function createEmptyExercise(): DraftExercise {
  return {
    exerciseName: "",
    equipmentType: "free_weight",
    notes: "",
    sets: [createEmptySet()]
  };
}

function toDraftExercises(session: StrengthSessionDto | undefined): DraftExercise[] {
  if (!session) {
    return [createEmptyExercise()];
  }

  return session.exercises.map((exercise) => ({
    exerciseName: exercise.exerciseName,
    equipmentType: exercise.equipmentType,
    notes: exercise.notes ?? "",
    sets: exercise.sets.map((set) => ({
      reps: set.reps.toString(),
      weightValue: set.weightValue?.toString() ?? "",
      weightUnit: set.weightUnit,
      restSeconds: set.restSeconds?.toString() ?? "",
      perceivedEffort: set.perceivedEffort?.toString() ?? "",
      notes: set.notes ?? ""
    }))
  }));
}

export function StrengthSessionForm({
  action,
  cancelHref,
  session,
  submitLabel
}: StrengthSessionFormProps) {
  const [exercises, setExercises] = useState<DraftExercise[]>(() => toDraftExercises(session));

  function updateExercise(index: number, nextExercise: Partial<DraftExercise>) {
    setExercises((current) =>
      current.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, ...nextExercise } : exercise
      )
    );
  }

  function updateSet(exerciseIndex: number, setIndex: number, nextSet: Partial<DraftSet>) {
    setExercises((current) =>
      current.map((exercise, currentExerciseIndex) =>
        currentExerciseIndex === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, currentSetIndex) =>
                currentSetIndex === setIndex ? { ...set, ...nextSet } : set
              )
            }
          : exercise
      )
    );
  }

  return (
    <form action={action} className="grid gap-7">
      <section className="grid gap-5 rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass} htmlFor="strength-date">
            Date <RequiredMark />
            <input
              className={inputClass}
              id="strength-date"
              name="sessionDate"
              required
              type="date"
              defaultValue={formatDateInputValue(session?.sessionDate)}
            />
          </label>

          <label className={labelClass} htmlFor="strength-workout-type">
            Workout type
            <select
              className={inputClass}
              id="strength-workout-type"
              name="workoutType"
              defaultValue={session?.workoutType ?? "full_body"}
            >
              {workoutTypes.map((workoutType) => (
                <option key={workoutType} value={workoutType}>
                  {workoutType.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass} htmlFor="strength-started-at">
            Start time
            <input
              className={inputClass}
              id="strength-started-at"
              name="startedAt"
              type="datetime-local"
              defaultValue={toDateTimeLocalValue(session?.startedAt)}
            />
          </label>

          <div className={labelClass}>
            <span>Duration</span>
            <SplitDurationInput
              idPrefix="strength-duration"
              name="duration"
              defaultValue={secondsToDurationInput(session?.durationSeconds)}
            />
          </div>
        </div>

        <label className={labelClass} htmlFor="strength-location">
          Location
          <input
            className={inputClass}
            id="strength-location"
            name="location"
            placeholder="Gym"
            defaultValue={session?.location ?? ""}
          />
        </label>
      </section>

      <section className="grid gap-5">
        <input name="exerciseCount" type="hidden" value={exercises.length} readOnly />
        {exercises.map((exercise, exerciseIndex) => (
          <div
            className="grid gap-5 rounded-lg border border-border bg-card p-4 sm:p-5"
            key={exerciseIndex}
          >
            <input
              name={`setCount_${exerciseIndex}`}
              type="hidden"
              value={exercise.sets.length}
              readOnly
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold tracking-normal">
                Exercise {exerciseIndex + 1}
              </h2>
              {exercises.length > 1 ? (
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setExercises((current) =>
                      current.filter((_, currentIndex) => currentIndex !== exerciseIndex)
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </Button>
              ) : null}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={labelClass} htmlFor={`exercise-name-${exerciseIndex}`}>
                Exercise <RequiredMark />
                <input
                  className={inputClass}
                  id={`exercise-name-${exerciseIndex}`}
                  name={`exerciseName_${exerciseIndex}`}
                  placeholder="Bench Press"
                  required
                  value={exercise.exerciseName}
                  onChange={(event) =>
                    updateExercise(exerciseIndex, { exerciseName: event.currentTarget.value })
                  }
                />
              </label>

              <label className={labelClass} htmlFor={`equipment-type-${exerciseIndex}`}>
                Equipment
                <select
                  className={inputClass}
                  id={`equipment-type-${exerciseIndex}`}
                  name={`equipmentType_${exerciseIndex}`}
                  value={exercise.equipmentType}
                  onChange={(event) =>
                    updateExercise(exerciseIndex, {
                      equipmentType: event.currentTarget.value as DraftExercise["equipmentType"]
                    })
                  }
                >
                  {equipmentTypes.map((equipmentType) => (
                    <option key={equipmentType} value={equipmentType}>
                      {equipmentType.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-3">
              {exercise.sets.map((set, setIndex) => (
                <div
                  className="grid gap-3 rounded-md border border-border bg-background p-3 md:grid-cols-[0.5fr_1fr_1fr_1fr_1fr_auto]"
                  key={setIndex}
                >
                  <p className="self-center text-sm font-semibold text-muted-foreground">
                    Set {setIndex + 1}
                  </p>
                  <label className={labelClass} htmlFor={`reps-${exerciseIndex}-${setIndex}`}>
                    Reps <RequiredMark />
                    <input
                      className={inputClass}
                      id={`reps-${exerciseIndex}-${setIndex}`}
                      inputMode="numeric"
                      name={`reps_${exerciseIndex}_${setIndex}`}
                      pattern="^\\d+$"
                      placeholder="8"
                      required
                      type="text"
                      value={set.reps}
                      onChange={(event) =>
                        updateSet(exerciseIndex, setIndex, { reps: event.currentTarget.value })
                      }
                    />
                  </label>
                  <label className={labelClass} htmlFor={`weight-${exerciseIndex}-${setIndex}`}>
                    Weight
                    <TextUnitInput
                      id={`weight-${exerciseIndex}-${setIndex}`}
                      inputMode="decimal"
                      name={`weightValue_${exerciseIndex}_${setIndex}`}
                      placeholder="60"
                      unit={set.weightUnit}
                      value={set.weightValue}
                      onChange={(event) =>
                        updateSet(exerciseIndex, setIndex, {
                          weightValue: event.currentTarget.value
                        })
                      }
                    />
                  </label>
                  <label className={labelClass} htmlFor={`unit-${exerciseIndex}-${setIndex}`}>
                    Unit
                    <select
                      className={inputClass}
                      id={`unit-${exerciseIndex}-${setIndex}`}
                      name={`weightUnit_${exerciseIndex}_${setIndex}`}
                      value={set.weightUnit}
                      onChange={(event) =>
                        updateSet(exerciseIndex, setIndex, {
                          weightUnit: event.currentTarget.value as DraftSet["weightUnit"]
                        })
                      }
                    >
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                    </select>
                  </label>
                  <label className={labelClass} htmlFor={`rpe-${exerciseIndex}-${setIndex}`}>
                    RPE
                    <input
                      className={inputClass}
                      id={`rpe-${exerciseIndex}-${setIndex}`}
                      inputMode="numeric"
                      name={`perceivedEffort_${exerciseIndex}_${setIndex}`}
                      pattern="^([1-9]|10)$"
                      placeholder="7"
                      type="text"
                      value={set.perceivedEffort}
                      onChange={(event) =>
                        updateSet(exerciseIndex, setIndex, {
                          perceivedEffort: event.currentTarget.value
                        })
                      }
                    />
                  </label>
                  {exercise.sets.length > 1 ? (
                    <Button
                      className="self-end"
                      size="icon"
                      type="button"
                      variant="outline"
                      onClick={() =>
                        updateExercise(exerciseIndex, {
                          sets: exercise.sets.filter((_, currentIndex) => currentIndex !== setIndex)
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  ) : null}
                </div>
              ))}

              <Button
                className="justify-self-start"
                type="button"
                variant="outline"
                onClick={() =>
                  updateExercise(exerciseIndex, { sets: [...exercise.sets, createEmptySet()] })
                }
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add set
              </Button>
            </div>

            <label className={labelClass} htmlFor={`exercise-notes-${exerciseIndex}`}>
              Exercise notes
              <textarea
                className={textareaClass}
                id={`exercise-notes-${exerciseIndex}`}
                name={`exerciseNotes_${exerciseIndex}`}
                placeholder="Form cues, pain, or setup notes..."
                value={exercise.notes}
                onChange={(event) =>
                  updateExercise(exerciseIndex, { notes: event.currentTarget.value })
                }
              />
            </label>
          </div>
        ))}

        <Button
          className="justify-self-start"
          type="button"
          variant="outline"
          onClick={() => setExercises((current) => [...current, createEmptyExercise()])}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add exercise
        </Button>
      </section>

      <label className={labelClass} htmlFor="strength-notes">
        Session notes
        <textarea
          className={textareaClass}
          id="strength-notes"
          name="notes"
          placeholder="How did the workout feel?"
          defaultValue={session?.notes ?? ""}
        />
      </label>

      <div>
        <FormActions cancelHref={cancelHref} submitLabel={submitLabel} />
      </div>
    </form>
  );
}
