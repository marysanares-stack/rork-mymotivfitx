import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { prisma } from '../../../../prisma/client';
import { TRPCError } from '@trpc/server';

// Optional: separate store for friend requests (not yet exposed via routes)
// Placeholder removed to avoid unused variable warnings. Implement when needed.

export default {
  list: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      // Friendship stored directionally, fetch all where userId = input.userId
      const rows = await prisma.friendship.findMany({
        where: { userId: input.userId },
        include: { friend: true },
        orderBy: { createdAt: 'desc' },
      });
  return rows.map((r: any) => r.friend);
    }),

  add: publicProcedure
    .input(z.object({ userId: z.string(), friendId: z.string() }))
    .mutation(async ({ input }) => {
      // Ensure both users exist
      const [user, friend] = await Promise.all([
        prisma.user.findUnique({ where: { id: input.userId } }),
        prisma.user.findUnique({ where: { id: input.friendId } }),
      ]);
      if (!user || !friend) throw new TRPCError({ code: 'NOT_FOUND', message: 'User or friend not found' });

      // Create bidirectional friendship (ignore if already exists)
      await prisma.friendship.upsert({
        where: { userId_friendId: { userId: input.userId, friendId: input.friendId } },
        update: {},
        create: { userId: input.userId, friendId: input.friendId },
      });
      await prisma.friendship.upsert({
        where: { userId_friendId: { userId: input.friendId, friendId: input.userId } },
        update: {},
        create: { userId: input.friendId, friendId: input.userId },
      });

      return { success: true };
    }),

  remove: publicProcedure
    .input(z.object({ userId: z.string(), friendId: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.friendship.deleteMany({
        where: {
          OR: [
            { userId: input.userId, friendId: input.friendId },
            { userId: input.friendId, friendId: input.userId },
          ],
        },
      });
      return { success: true };
    }),

  search: publicProcedure
    .input(z.object({ query: z.string(), currentUserId: z.string() }))
    .query(async ({ input }) => {
      const term = input.query.trim();
      if (!term) return [];
      const users = await prisma.user.findMany({
        where: {
          AND: [
            { id: { not: input.currentUserId } },
            {
              OR: [
                { name: { contains: term } },
                { email: { contains: term } },
              ],
            },
          ],
        },
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
      return users;
    }),
};
