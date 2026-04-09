export const MAX_SAME_ACTION_PER_DAY = 3;
export const MAX_HEALTHY_REDUCTION_PER_DAY = 30;

export function calculateEffectivePointValue({
  currentTotalPoints,
  actionPointValue,
  healthyReductionUsedToday,
}: {
  currentTotalPoints: number;
  actionPointValue: number;
  healthyReductionUsedToday: number;
}) {
  if (actionPointValue >= 0) {
    return actionPointValue;
  }

  const requestedReduction = Math.abs(actionPointValue);
  const remainingHealthyReduction = Math.max(
    0,
    MAX_HEALTHY_REDUCTION_PER_DAY - healthyReductionUsedToday,
  );
  const allowedReduction = Math.min(
    requestedReduction,
    remainingHealthyReduction,
    Math.max(0, currentTotalPoints),
  );

  return allowedReduction === 0 ? 0 : -allowedReduction;
}

