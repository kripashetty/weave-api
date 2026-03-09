// TODO: Implement auth business logic.
//
// Responsibilities:
//   - register(dto): hash password (bcrypt, cost 12), create User + Family in a
//     single transaction, issue initial token pair
//   - login(dto): verify credentials, issue access token (RS256, 15 min) and
//     refresh token (stored in Redis under key refresh:<userId>:<tokenId>, 30 days)
//   - refresh(token): validate refresh token from Redis, rotate it (delete old,
//     write new), return new access token — stolen token detection: if a used token
//     is presented again, call invalidateAllFamilySessions()
//   - logout(userId): delete refresh token from Redis
//   - invalidateAllFamilySessions(familyId): delete all Redis keys for the family
//     (pattern refresh:<userId>:* for every member)
//
// Returns Result<T, AppError> — never throws across module boundaries.
// Delegates all DB reads/writes to AuthRepository.
// Delegates token signing/verification to the JWT utility in shared/utils (TODO).

export class AuthService {
  // TODO: implement
}
