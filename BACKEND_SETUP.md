# Backend Integration Guide

Your MyMotivFitX app now has full backend persistence using Prisma + SQLite (dev) with tRPC for type-safe API calls.

## What's Integrated

### Backend (Prisma + SQLite)
- **Database**: SQLite file at `prisma/dev.db` (persists between restarts)
- **Models**: User, Friendship
- **Routes**: 
  - `user.profile.get/create/update/list` - User CRUD
  - `user.friends.list/add/remove/search` - Friend management

### Frontend (React Query + tRPC)
- **FitnessContext**: Automatically syncs user with backend on app load
  - Creates user on backend if doesn't exist
  - Updates backend when profile changes
- **SocialContext**: Fetches real friends list from backend
  - Queries `user.friends.list` on mount
  - Mutations available: `addFriendMutation`, `removeFriendMutation`

## Running Locally

### 1. Start the Backend
```bash
# Ensure dependencies are installed
npm install

# Start backend server (uses tsx, no bun needed)
npm run backend:dev
```

Server runs at `http://localhost:3000`
- API endpoint: `http://localhost:3000/api/trpc`
- Health check: `http://localhost:3000/` (returns `{"status":"ok"}`)

### 2. Point App to Local Backend

**Option A: Environment variable (temporary)**
```bash
export EXPO_PUBLIC_RORK_API_BASE_URL="http://localhost:3000"
npx expo start --tunnel
```

**Option B: Update app.json (persistent)**
```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_RORK_API_BASE_URL": "http://localhost:3000"
    }
  }
}
```

**Current Default**: Points to `https://mymotivfitx-api.fly.dev` (deploy this backend there for production)

## Database Management

### View Data
```bash
# Open Prisma Studio (GUI for browsing data)
npx prisma studio
```

### Reset Database
```bash
# Delete all data and re-run migrations
npx prisma migrate reset
```

### Create Migration
```bash
# After changing prisma/schema.prisma
npx prisma migrate dev --name describe_your_change
```

## Upgrading to PostgreSQL

For production, switch from SQLite to Postgres:

1. **Update `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **Set DATABASE_URL in `.env`:**
```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

3. **Run migration:**
```bash
npx prisma migrate dev --name switch_to_postgres
```

## What Data Persists

✅ **Backend (Prisma DB)**
- User profiles (id, name, email, avatar, weight, height, age, gender)
- Friendships (bidirectional)

❌ **Still Local Only (AsyncStorage)**
- Activities, workouts, sleep, water, moods
- Badges, goals, workout plans
- Groups, messages, challenges

*Future: Add backend routes for these and wire contexts accordingly*

## Troubleshooting

**"Cannot find module @prisma/client"**
```bash
npm install
npx prisma generate
```

**"User not found" errors**
- Backend creates user automatically on first app launch
- Check logs: `[FitnessContext] Failed to sync user with backend`
- Verify backend is running and `EXPO_PUBLIC_RORK_API_BASE_URL` is set

**Friends list empty**
- Normal on first launch—no friends yet
- Add friends via backend: `trpc.user.friends.add.mutate({ userId, friendId })`
- Or seed database (see Prisma docs)

## Deployment Status

✅ **Backend is LIVE at**: `https://mymotivfitx-api.fly.dev/`

Your app is configured to use this backend automatically. When users open the app:
1. FitnessContext loads user from AsyncStorage
2. Automatically syncs with backend (creates user if not exists)
3. SocialContext fetches friends list from backend database

### Deploy Backend Updates
```bash
# Add Fly CLI to your PATH (one-time setup)
export PATH="/Users/marysanares/.fly/bin:$PATH"

# Deploy changes
flyctl deploy --remote-only

# View logs
flyctl logs --app mymotivfitx-api

# SSH into container
flyctl ssh console --app mymotivfitx-api

# Run Prisma migrations on production
flyctl ssh console -C "npx prisma migrate deploy"
```

### Testing Backend Integration

**1. Check backend health:**
```bash
# Via browser or Simple Browser in VS Code
# https://mymotivfitx-api.fly.dev/
# Should return: {"status":"ok","message":"API is running"}
```

**2. Test from your app:**
- Open app in TestFlight or Expo Go
- Check Metro logs for: `[FitnessContext] Failed to sync user with backend`
- If no errors → backend sync is working! ✅

**3. View database:**
```bash
# SSH into Fly container and open Prisma Studio
flyctl ssh console --app mymotivfitx-api
# Then inside container:
npx prisma studio
# Forward port 5555 to access locally
```

## Next Steps

1. ✅ ~~Deploy backend to Fly.io~~ **DONE!**
2. Add friend invite/search UI
3. Migrate activities, groups, etc. to backend for multi-device sync
4. Add authentication (Clerk, Auth0, or custom JWT)
5. Upgrade to PostgreSQL for better production scalability
