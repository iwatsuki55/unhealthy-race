import Link from "next/link";

import { createGoalAction } from "@/app/goals/actions";
import { GoalForm } from "@/modules/goals/presentation/goal-form";

export default function NewGoalPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link className="text-sm text-muted-foreground hover:text-foreground" href="/goals">
          Back to goals
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">New Goal</h1>
      </div>

      <section>
        <GoalForm action={createGoalAction} cancelHref="/goals" submitLabel="Save goal" />
      </section>
    </div>
  );
}
