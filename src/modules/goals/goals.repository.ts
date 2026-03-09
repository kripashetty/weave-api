// TODO: Implement goals database access layer.
//
// Responsibilities:
//   - findGoals(familyId, filters): query active goals — use @@index([familyId, archivedAt])
//   - findGoalById(familyId, goalId): single goal, scoped to familyId
//   - createGoal(data): insert new goal
//   - updateGoal(familyId, goalId, data): update — always include familyId filter
//   - archiveGoal(familyId, goalId): set archivedAt
//   - createCheckin(data): insert GoalCheckin — Prisma will surface unique constraint
//     violation if duplicate check-in for same goalId + weekStart
//   - findCheckins(goalId): order by weekStart desc

export class GoalsRepository {
  // TODO: implement
}
