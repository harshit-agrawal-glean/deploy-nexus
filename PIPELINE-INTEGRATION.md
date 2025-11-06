# Pipeline Integration Guide

This guide explains how to integrate GitHub Actions and Spinnaker pipelines into the Deploy Nexus Dashboard, creating a unified deployment interface.

## Overview

The Deploy Nexus Dashboard can read and trigger pipelines from:

- **GitHub Actions** workflows (`.yml` files)
- **Spinnaker** pipelines (`.json` files)

This creates a single UI where engineers, QA, and other stakeholders can trigger deployments regardless of the underlying system.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Deploy Nexus Dashboard (Frontend)          │
│  - Unified Pipeline List                                    │
│  - Dynamic Parameter Forms                                  │
│  - Execution Monitoring                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├── API Calls
                       │
┌──────────────────────┴──────────────────────────────────────┐
│              Backend API Server (Node.js/Express)           │
│  - File System Reader                                       │
│  - Pipeline Parser                                          │
│  - GitHub Actions API Client                               │
│  - Spinnaker API Client                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────┴────────┐           ┌────────┴────────┐
│ GitHub Actions │           │    Spinnaker    │
│   Workflows    │           │    Pipelines    │
└────────────────┘           └─────────────────┘
```

## Directory Structure

```
Deploy Nexus Dashboard/
├── backend/
│   ├── server.ts           # Backend API server
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables
├── src/
│   ├── services/
│   │   ├── pipelineParser.ts   # Parse GH Actions & Spinnaker
│   │   └── pipelineLoader.ts   # Load and trigger pipelines
│   └── types/
│       └── index.ts        # Updated types with PipelineParameter
└── PIPELINE-INTEGRATION.md # This file
```

## Setup Instructions

### 1. Configure Pipeline Sources

Edit `src/services/pipelineLoader.ts` to specify which pipelines to load:

```typescript
export const PIPELINE_SOURCES: PipelineDirectory[] = [
  {
    path: "/Users/harshit.agrawal/workspace/scio/.github/workflows",
    type: "github-actions",
    allowlist: [
      "deploy-build-and-deploy-custom-experimental.yml",
      // Add more workflows here
    ],
  },
  {
    path: "/Users/harshit.agrawal/workspace/scio/terraform/glean.com/internal/scio-engineering-spinnaker-pri/deploy",
    type: "spinnaker",
    allowlist: [
      "deploy-latest-qualified-version.json",
      "deploy-custom-aws.json",
      // Add more pipelines here
    ],
  },
];
```

### 2. Set Up Backend Server

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create `backend/.env`:

```bash
# Server
PORT=3001

# GitHub Integration
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your-org
GITHUB_REPO=scio

# Spinnaker Integration
SPINNAKER_API_URL=https://spinnaker.your-company.com
```

#### Generate GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Create a token with these scopes:
   - `repo` (to access workflows)
   - `workflow` (to trigger workflows)

#### Start the Backend

```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Update Frontend Configuration

Update the frontend to use the backend API. In `vite.config.ts`, add proxy:

```typescript
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
```

### 4. Load Pipelines in Dashboard

Update `PipelinesView.tsx` or create a new pipeline initialization:

```typescript
import { loadAllPipelines } from "../services/pipelineLoader";

// In your component
useEffect(() => {
  const initializePipelines = async () => {
    const loadedPipelines = await loadAllPipelines();
    setPipelines([...mockPipelines, ...loadedPipelines]);
  };

  initializePipelines();
}, []);
```

## How It Works

### GitHub Actions Integration

1. **Reading Workflows**: The backend reads `.yml` files from the workflows directory
2. **Parsing Parameters**: Extracts `workflow_dispatch.inputs` as form parameters
3. **Triggering**: Uses GitHub API to trigger `workflow_dispatch` events
4. **Monitoring**: Polls GitHub API for workflow run status

Example workflow structure:

```yaml
on:
  workflow_dispatch:
    inputs:
      scio-instance:
        description: "Instance name"
        required: true
        default: "glean-dev"
      operations:
        description: "Operations to deploy"
        type: choice
        options:
          - "ALL"
          - "CUSTOM"
```

### Spinnaker Integration

1. **Reading Pipelines**: The backend reads `.json` files from the deploy directory
2. **Parsing Parameters**: Extracts `parameterConfig` as form parameters
3. **Triggering**: Uses Spinnaker API to start pipeline executions
4. **Monitoring**: Polls Spinnaker API for execution status

Example pipeline structure:

```json
{
  "name": "Deploy Latest Qualified Version",
  "parameterConfig": [
    {
      "name": "scio_instance",
      "description": "Instances to deploy",
      "required": false,
      "default": ""
    },
    {
      "name": "operations",
      "description": "Operations to deploy",
      "required": true,
      "default": "ALL"
    }
  ]
}
```

## API Endpoints

### Pipeline Loading

- `GET /api/pipelines/list?path=/path/to/dir` - List pipeline files
- `GET /api/pipelines/load?path=/path/to/file` - Load pipeline content

### GitHub Actions

- `POST /api/github/trigger` - Trigger workflow

  ```json
  {
    "workflow": "deploy.yml",
    "ref": "master",
    "inputs": {
      "scio-instance": "glean-dev",
      "operations": "ALL"
    }
  }
  ```

- `GET /api/github/runs?workflow=deploy.yml` - Get workflow runs

### Spinnaker

- `POST /api/spinnaker/trigger` - Trigger pipeline

  ```json
  {
    "application": "deploy",
    "pipelineName": "Deploy Latest Qualified Version",
    "parameters": {
      "scio_instance": "glean-dev",
      "operations": "ALL"
    }
  }
  ```

- `GET /api/spinnaker/executions?application=deploy&pipeline=name` - Get executions

## Benefits

### ✅ Unified Interface

- Single dashboard for all deployment systems
- Consistent UX regardless of pipeline source
- No need to switch between GitHub Actions UI and Spinnaker UI

### ✅ Dynamic Forms

- Parameters are automatically extracted from pipeline definitions
- Forms are generated dynamically
- No manual form configuration needed

### ✅ Access Control

- Can integrate with your RBAC system
- Control who can trigger which pipelines
- Audit trail of all deployments

### ✅ Better Visibility

- All deployments in one place
- Easier to track and monitor
- Unified deployment history

## Adding New Pipelines

To add a new pipeline to the dashboard:

1. **Add to Allowlist**

   ```typescript
   // In pipelineLoader.ts
   allowlist: [
     "existing-pipeline.yml",
     "new-pipeline.yml", // Add this
   ];
   ```

2. **Restart Backend**

   ```bash
   cd backend
   npm run dev
   ```

3. **Refresh Dashboard** - The new pipeline will appear automatically!

## Security Considerations

1. **GitHub Token**: Store securely, use environment variables
2. **File System Access**: Backend has read access to pipeline directories
3. **API Authentication**: Consider adding authentication to backend endpoints
4. **RBAC Integration**: Integrate with your organization's access control
5. **Audit Logging**: Log all pipeline triggers with user information

## Troubleshooting

### Pipeline Not Appearing

1. Check if file is in allowlist
2. Check backend logs for parsing errors
3. Verify file path is correct
4. Ensure file is valid YAML/JSON

### Trigger Fails

1. Check GitHub token permissions
2. Verify Spinnaker API URL
3. Check backend logs for API errors
4. Ensure parameters match expected format

### Monitoring Not Working

1. Verify API credentials
2. Check network connectivity
3. Ensure polling intervals are configured
4. Check for rate limiting

## Future Enhancements

- [ ] Real-time updates via WebSockets
- [ ] Pipeline execution logs display
- [ ] Deployment approval workflows
- [ ] Rollback capabilities
- [ ] Custom parameter validators
- [ ] Pipeline templates
- [ ] Multi-environment support
- [ ] Deployment scheduling

## Support

For issues or questions:

1. Check backend logs: `backend/logs/`
2. Check browser console for frontend errors
3. Review API response status codes
4. Contact your deployment team
