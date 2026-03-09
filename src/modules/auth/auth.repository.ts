// TODO: Implement auth database access layer.
//
// Responsibilities:
//   - findUserByEmail(email): look up a user by email for login
//   - createUserWithFamily(dto): create a new Family and User in one Prisma
//     interactive transaction — atomicity is required here
//   - findUserById(id): used by the JWT authenticate middleware to hydrate req.user
//
// Rules:
//   - All Prisma calls are made here — never in the service or route handler
//   - Always filter by familyId where applicable (tenant isolation, ADR-07)
//   - Use the shared Prisma singleton from @shared/db/prisma

export class AuthRepository {
  // TODO: implement
}
