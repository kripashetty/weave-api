// TODO: Implement goals module tests.
//
// Test cases to cover:
//
// GoalsService.createGoal
//   - creates goal with valid input
//   - rejects if ownerId is not a member of the family
//
// GoalsService.archiveGoal
//   - sets archivedAt
//   - returns 404 if goal does not belong to the family
//
// GoalsService.createCheckin
//   - normalises weekStart to Monday 00:00:00 UTC regardless of input day
//   - creates check-in successfully
//   - returns 409 if check-in already exists for that goal + week
//
// Insight trigger tests:
//   - verify SQS event is published after createGoal, updateGoal, createCheckin

import { describe, it } from 'vitest';

describe('GoalsService', () => {
  // TODO: implement tests
});
