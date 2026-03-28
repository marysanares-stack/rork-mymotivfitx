// Shared in-memory users store for demo/testing.
// NOTE: Replace with a real database (e.g., Postgres + Prisma) for production use.

export type UsersStoreRecord = Record<string, any>;

export const usersStore: Map<string, any> = new Map();
