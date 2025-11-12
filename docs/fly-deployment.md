# Deploying MyMotivFitX Backend to Fly.io

This guide walks you through deploying your Hono/tRPC backend to Fly.io.

## Prerequisites

- GitHub account (for sign-up)
- Credit card (required for Fly.io, won't be charged for free tier usage)

## Step 1: Sign Up for Fly.io

1. Go to https://fly.io/app/sign-up
2. Click **"Continue with GitHub"**
3. Authorize Fly.io to access your GitHub
4. Add your payment method when prompted

## Step 2: Install Fly.io CLI

**macOS:**
```bash
curl -L https://fly.io/install.sh | sh
```

After installation, add to your PATH (the installer will show you the command).

**Verify installation:**
```bash
flyctl version
```

## Step 3: Login to Fly.io

```bash
flyctl auth login
```

This will open your browser to complete authentication.

## Step 4: Deploy Your Backend

**From your project root** (`/Users/marysanares/rork-mymotivfitx`):

```bash
# Create the Fly.io app (first time only)
flyctl launch --no-deploy

# When prompted:
# - App name: Choose a unique name (e.g., mymotivfitx-api-yourname)
# - Region: Select one close to you (e.g., sjc for San Jose)
# - PostgreSQL: No (we're using local AsyncStorage for now)
# - Redis: No

# Deploy
flyctl deploy
```

## Step 5: Get Your Production URL

After deployment succeeds, Fly will show your URL:
```
https://your-app-name.fly.dev
```

Copy this URL—you'll need it for the next step.

## Step 6: Test Your Backend

```bash
# Check if it's running
curl https://your-app-name.fly.dev

# Should return: {"status":"ok","message":"API is running"}
```

## Step 7: Wire URL into Your App

Once you have the URL, come back and I'll update your `eas.json` to use it for production builds.

## Repository to Link

**Important:** You're deploying from this repository:
```
marysanares-stack/rork-mymotivfitx
```

However, Fly.io deployment is CLI-based (push from local), not continuous deployment from GitHub. You'll run `flyctl deploy` from your local machine.

If you want automatic deployments on every GitHub push, you can set up GitHub Actions later.

## Troubleshooting

**If deployment fails:**
```bash
# Check logs
flyctl logs

# SSH into the machine
flyctl ssh console

# Restart the app
flyctl apps restart
```

**If you need to update:**
```bash
# Make code changes, then redeploy
flyctl deploy
```

## Cost

Free tier includes:
- 3 shared-cpu VMs (we use 1)
- 160GB bandwidth/month
- Your app auto-stops when idle and starts on request

You won't be charged unless you exceed these limits.

## Next Steps

After deploying, share your Fly.io URL with me and I'll:
1. Update `eas.json` with the production API URL
2. Show you the final EAS build commands
3. Get you ready for TestFlight submission
