import { requireUserId } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { AddGoalForm } from "./add-goal-form";
import { GoalCard } from "./goal-card";

export default async function GoalsPage() {
  const userId = await requireUserId();

  const goals = await db.goal.findMany({
    where: { userId },
    include: { milestones: { orderBy: { orderIndex: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Goals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Long-term ambitions, broken into milestones you can chip away at.
        </p>
      </div>

      <AddGoalForm />

      {goals.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No goals yet. Add one above — certifications, exam targets, side projects.
        </p>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
