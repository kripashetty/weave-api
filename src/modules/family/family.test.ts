// TODO: Implement family module tests.
//
// Test cases to cover:
//
// FamilyService.getFamily
//   - returns family with members for a valid familyId
//   - returns 404 if family not found
//
// FamilyService.updateFamilyName
//   - updates name when caller is ADMIN
//   - returns 403 when caller is MEMBER
//
// FamilyService.removeMember
//   - removes member when caller is ADMIN
//   - returns 403 when caller is MEMBER
//   - returns 400 when ADMIN tries to remove themselves
//
// Route integration tests:
//   GET  /family          — 200 with family payload
//   PATCH /family         — 200 for ADMIN, 403 for MEMBER
//   DELETE /family/members/:userId — 204 for ADMIN, 403 for MEMBER

import { describe } from 'vitest'

describe('FamilyService', () => {
  // TODO: implement tests
})
