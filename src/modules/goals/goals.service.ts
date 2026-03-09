// TODO: Implement goals business logic.
//
// Responsibilities:
//   - listGoals(familyId, filters): return active goals (archivedAt = null) with
//     most recent check-in. Optional filter by ownerId.
//   - createGoal(familyId, dto): create a new goal — ownerId must be a member of familyId
//   - getGoal(familyId, goalId): return goal with full check-in history
//   - updateGoal(familyId, goalId, dto): update allowed fields — cannot change ownerId
//   - archiveGoal(familyId, goalId): set archivedAt = now() — soft delete
//   - createCheckin(familyId, goalId, userId, dto): normalise weekStart to Monday 00:00:00 UTC,
//     insert check-in — the @@unique([goalId, weekStart]) constraint enforces one per week
//   - listCheckins(familyId, goalId): return check-ins in reverse chronological order
//
// Publishes SQS event after any write to trigger insight recalculation.
// Returns Result<T, AppError> — never throws across module boundaries.

export class GoalsService {
  // TODO: implement
}
