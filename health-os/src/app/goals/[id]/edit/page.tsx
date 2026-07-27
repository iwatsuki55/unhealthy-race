import Link from "next/link";
import { notFound } from "next/navigation";

import { updateGoalAction } from "@/app/goals/actions";
import { getCurrentUserId } from "@/core/application/current-user";
import { goalRepository } from "@/modules/goals/infrastructure";
import { GoalForm } from "@/modules/goals/presentation/goal-form";

interface EditGoalPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditGoalPage({ params }: EditGoalPageProps) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const goal = await goalRepository.findById(userId, id);

  if (!goal) {
    notFound();
  }

  const updateGoal = updateGoalAction.bind(null, goal.id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href={`/goals/${goal.id}`}
        >
          Back to goal
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Edit Goal</h1>
      </div>

      <section>
        <GoalForm action={updateGoal} goal={goal} submitLabel="Save goal" />
      </section>
    </div>
  );
}
