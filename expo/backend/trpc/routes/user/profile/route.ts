import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { prisma } from '../../../../prisma/client';
import { TRPCError } from '@trpc/server';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().optional(),
  avatarUrl: z.string().optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
  age: z.number().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  friends: z.array(z.string()).optional(),
});

export default {
  get: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
  return user;
    }),

  update: publicProcedure
    .input(z.object({
      userId: z.string(),
      data: UserSchema.partial().omit({ id: true }),
    }))
    .mutation(async ({ input }) => {
      const updated = await prisma.user.update({
        where: { id: input.userId },
        data: {
          name: input.data.name ?? undefined,
          email: input.data.email ?? undefined,
          avatar: input.data.avatar ?? undefined,
          avatarUrl: input.data.avatarUrl ?? undefined,
          weight: input.data.weight ?? undefined,
          height: input.data.height ?? undefined,
          age: input.data.age ?? undefined,
          gender: (input.data as any).gender ?? undefined,
        },
      });
      return updated;
    }),

  create: publicProcedure
    .input(UserSchema.omit({ id: true, friends: true }))
    .mutation(async ({ input }) => {
      const created = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          avatar: input.avatar,
          avatarUrl: input.avatarUrl,
          weight: input.weight,
          height: input.height,
          age: input.age,
          gender: (input as any).gender,
        },
      });
      return created;
    }),

  list: publicProcedure
    .query(async () => {
      return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    }),
};
