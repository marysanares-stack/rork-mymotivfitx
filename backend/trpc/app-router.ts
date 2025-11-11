import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import userProfileRoute from './routes/user/profile/route';
import userFriendsRoute from './routes/user/friends/route';

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  user: createTRPCRouter({
    profile: userProfileRoute,
    friends: userFriendsRoute,
  }),
});

export type AppRouter = typeof appRouter;
