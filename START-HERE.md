# Getting Started with Deploy Nexus Dashboard

This guide will help you start the application and see the pipeline integration in action.

## Quick Start

### Prerequisites

✅ Backend dependencies installed
✅ Frontend dependencies installed  
✅ Vite proxy configured
✅ Pipeline sources configured

### Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd "/Users/harshit.agrawal/Downloads/Deploy Nexus Dashboard/backend"
npm run dev
```

You should see:

```
Deploy Nexus Backend API running on port 3001
GitHub integration: Disabled (No token configured)
Spinnaker API URL: https://spinnaker.example.com
```

**Note:** The backend will run without a GitHub token. It can read pipeline files but won't be able to trigger workflows until you configure a token.

### Step 2: Start the Frontend

Open a **new terminal** and run:

```bash
cd "/Users/harshit.agrawal/Downloads/Deploy Nexus Dashboard"
npm run dev
```

The application will open in your browser at `http://localhost:3000`

### Step 3: View the Pipelines

1. Navigate to the **Pipelines** tab
2. You should see:
   - Existing mock pipelines
   - **New pipelines** loaded from GitHub Actions (with GitHub icon badge)
   - **New pipelines** loaded from Spinnaker (with blue Spinnaker badge)
   - A success toast notification showing how many pipelines were loaded

## What You'll See

### Pipeline List

- **Mock Pipelines**: Your existing test pipelines
- **GitHub Actions**: Workflows from `.github/workflows/` with a black GitHub badge
- **Spinnaker**: Pipelines from the Spinnaker deploy directory with a blue badge

### Features Working

✅ Pipeline loading from file system
✅ Source badges showing pipeline origin  
✅ All pipeline parameters extracted automatically
✅ DAG visualization for stages
✅ Search and filter functionality
✅ Expandable deployment forms

### Features Not Yet Working (require tokens)

❌ Triggering GitHub Actions workflows
❌ Triggering Spinnaker pipelines
❌ Fetching execution status

## Configured Pipeline Sources

The system is configured to load from:

1. **GitHub Actions**:

   - Path: `/Users/harshit.agrawal/workspace/scio/.github/workflows`
   - Files: `deploy-build-and-deploy-custom-experimental.yml`

2. **Spinnaker**:
   - Path: `/Users/harshit.agrawal/workspace/scio/terraform/glean.com/internal/scio-engineering-spinnaker-pri/deploy`
   - Files:
     - `deploy-latest-qualified-version.json`
     - `deploy-custom-aws.json`
     - `deploy-custom-azure.json`

## Adding More Pipelines

To add more pipelines to the dashboard:

1. Edit `src/services/pipelineLoader.ts`
2. Add file names to the `allowlist` arrays
3. Restart the frontend
4. The new pipelines will appear automatically!

```typescript
allowlist: [
  "deploy-build-and-deploy-custom-experimental.yml",
  "your-new-workflow.yml", // Add this
];
```

## Troubleshooting

### Backend won't start

**Error:** Port 3001 already in use

**Solution:**

```bash
lsof -i :3001
kill -9 <PID>
```

### No pipelines loading

**Check:**

1. Backend is running (check terminal)
2. Paths in `pipelineLoader.ts` are correct
3. Files exist at those paths
4. Browser console for errors (F12)

### Files not found

**Verify paths:**

```bash
ls "/Users/harshit.agrawal/workspace/scio/.github/workflows"
ls "/Users/harshit.agrawal/workspace/scio/terraform/glean.com/internal/scio-engineering-spinnaker-pri/deploy"
```

## Testing the API

You can test the backend API directly:

### List workflow files

```bash
curl "http://localhost:3001/api/pipelines/list?path=/Users/harshit.agrawal/workspace/scio/.github/workflows"
```

### Load a workflow

```bash
curl "http://localhost:3001/api/pipelines/load?path=/Users/harshit.agrawal/workspace/scio/.github/workflows/deploy-build-and-deploy-custom-experimental.yml"
```

### Health check

```bash
curl "http://localhost:3001/health"
```

## Next Steps

Once you're satisfied with the UI:

1. **Add GitHub Token**: Configure `GITHUB_TOKEN` to enable triggering
2. **Add Spinnaker URL**: Configure `SPINNAKER_API_URL` for Spinnaker integration
3. **Add More Pipelines**: Update allowlists in `pipelineLoader.ts`
4. **Custom Parameters**: Modify forms in deployment config
5. **RBAC Integration**: Add access controls

## Architecture

```
┌─────────────────────────────────────┐
│  Frontend (React + Vite)            │
│  Port: 3000                         │
│  - PipelinesView                    │
│  - PipelineSourceBadge              │
│  - Dynamic Forms                    │
└─────────────┬───────────────────────┘
              │
              │ /api/* proxied to backend
              │
┌─────────────▼───────────────────────┐
│  Backend (Express + Node.js)        │
│  Port: 3001                         │
│  - File System Reader               │
│  - YAML/JSON Parser                 │
│  - GitHub API (when token set)      │
│  - Spinnaker API (when URL set)     │
└─────────────┬───────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼────────┐   ┌──────▼─────┐
│  GitHub    │   │ Spinnaker  │
│  Actions   │   │ Pipelines  │
└────────────┘   └────────────┘
```

## Success Indicators

You know it's working when:

✅ Backend starts without errors
✅ Frontend shows loading spinner
✅ Toast notification: "Loaded X pipeline(s)..."
✅ Pipeline list shows badges (GitHub/Spinnaker)
✅ Can expand rows to see deployment forms
✅ Pipeline parameters are populated from config
✅ DAG visualization shows stage dependencies

## Support

If you encounter issues:

1. Check both terminal outputs (frontend + backend)
2. Open browser DevTools (F12) and check Console
3. Verify file paths exist
4. Review `PIPELINE-INTEGRATION.md` for detailed docs
5. Check `QUICK-START-INTEGRATION.md` for setup guide

---

**Happy Deploying! 🚀**
