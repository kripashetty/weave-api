// TODO: Define Zod schemas for all calendar request and response bodies.
//
// Schemas to define:
//   EventsQuerySchema        — { startDate, endDate } (ISO 8601 strings, query params)
//   CalendarEventResponse    — { id, externalId, title, description?, startTime, endTime,
//                               isAllDay, color?, calendarAccountId, familyId }
//   CalendarAccountResponse  — { id, userId, provider, providerAccountId?, lastSyncedAt?,
//                               syncFailureCount, createdAt }
//   ConnectAccountSchema     — { code } (OAuth callback code)
//   DisconnectParamsSchema   — { id } (accountId path param)

import { z } from 'zod';

// TODO: implement schema definitions
export const EventsQuerySchema = z.object({});
export const ConnectAccountSchema = z.object({});
