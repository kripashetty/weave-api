// TODO: Define Zod schemas for all family request and response bodies.
//
// Schemas to define:
//   FamilyResponseSchema     — { id, name, organisationId, createdAt, members[] }
//   UpdateFamilySchema       — { name }
//   InviteMemberSchema       — { email, name }
//   RemoveMemberParamsSchema — { userId }

import { z } from 'zod'

// TODO: implement schema definitions
export const UpdateFamilySchema = z.object({})
export const InviteMemberSchema = z.object({})
