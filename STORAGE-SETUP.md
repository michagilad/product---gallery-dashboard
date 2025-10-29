# Cross-Device Data Sync Setup

The dashboard now supports syncing data across devices using your existing GitHub account! No new service registration needed.

## Setup Steps (Using GitHub - No New Account!)

Since you're already using GitHub for this project, we can use the GitHub API to update the `public/data/stats.json` file directly in your repository.

### 1. Create a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Give it a name like "Dashboard Stats Sync"
4. Select the **`repo`** scope (this allows reading and writing repository files)
5. Click **Generate token**
6. **Copy the token immediately** (you won't see it again!)

### 2. Get Your Repository Info

You'll need:
- **Repository name** in the format: `username/repository-name`
  - Example: If your repo is at `https://github.com/johndoe/product-gallery-dashboard`, then use `johndoe/product-gallery-dashboard`
- **Branch name** (usually `main` or `master`)

### 3. Configure Netlify Environment Variables

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add these variables:
   - `GITHUB_TOKEN` = your personal access token (from step 1)
   - `GITHUB_REPO` = your repository in format `username/repo-name`
   - `GITHUB_BRANCH` = `main` (or `master` if that's your branch name)

### 4. Redeploy Your Site

1. Go to **Deploys** in Netlify
2. Click **Trigger deploy** → **Deploy site**

That's it! Your dashboard will now sync data across all devices by updating the file in your GitHub repository.

## How It Works

1. **On Save**: When you update data in admin mode, it saves to your `public/data/stats.json` file in the GitHub repository
2. **On Load**: All devices fetch the latest version from your GitHub repository
3. **Auto-Sync**: Since the file is in your repo, Netlify will rebuild on changes, and all users get the latest data

## Alternative: Manual Environment Variable (Not Recommended)

If you prefer not to use GitHub API:
1. Go to **Site settings** → **Environment variables** in Netlify
2. Add `DASHBOARD_STATS` with your JSON data
3. Note: You'll need to manually update this whenever data changes (not automated)

## How It Works

1. **On Load**: The dashboard tries to fetch data from:
   - The Netlify Function API (`/.netlify/functions/get-stats`)
     - Which reads from your GitHub repository
   - Falls back to the public JSON file (`/data/stats.json`)
   - Falls back to localStorage (device-specific cache)

2. **On Save**: When you update data in admin mode:
   - Data is saved to localStorage (immediate)
   - Data is sent to the API (`/.netlify/functions/save-stats`)
   - If GitHub is configured, it updates the file in your repository
   - Other devices will get the updated data on next load

## Troubleshooting

- **Data not syncing?** 
  - Check Netlify function logs to see if GitHub API calls are successful
  - Verify your `GITHUB_TOKEN` has `repo` permissions
  - Make sure `GITHUB_REPO` is in the correct format: `username/repo-name`
- **Still seeing old data?** 
  - Clear your browser cache and localStorage
  - The file in GitHub might have been updated - try refreshing
- **API errors?** 
  - Make sure your environment variables are set correctly in Netlify
  - Check that your GitHub token hasn't expired
  - Verify the repository path is correct

## Current Status

Without GitHub setup, the dashboard will:
- ✅ Work on each device individually (using localStorage)
- ✅ Load initial data from the public JSON file
- ❌ **NOT sync across devices** (this is the issue you reported)

With GitHub setup, the dashboard will:
- ✅ Sync data across all devices
- ✅ Persist data in your repository (visible in GitHub)
- ✅ Work seamlessly!

