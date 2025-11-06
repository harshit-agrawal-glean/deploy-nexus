# Quick Start: Pipeline Integration

This guide will help you quickly integrate GitHub Actions and Spinnaker pipelines into your Deploy Nexus Dashboard.

## Prerequisites

- Node.js 18+ installed
- Access to your repository's workflow files
- GitHub Personal Access Token
- (Optional) Spinnaker API access

## Step 1: Install Backend Dependencies (5 minutes)

```bash
cd backend
npm install
```

## Step 2: Configure Environment (3 minutes)

Create `backend/.env`:

```bash
# Copy this content
PORT=3001
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=your-org
GITHUB_REPO=scio
SPINNAKER_API_URL=https://spinnaker.your-company.com
```

### Get GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `workflow`
4. Copy the token to `.env`

## Step 3: Configure Pipelines (2 minutes)

Edit `src/services/pipelineLoader.ts`:

```typescript
export const PIPELINE_SOURCES: PipelineDirectory[] = [
  {
    path: "/Users/harshit.agrawal/workspace/scio/.github/workflows",
    type: "github-actions",
    allowlist: [
      "deploy-build-and-deploy-custom-experimental.yml",
      // Add more files here
    ],
  },
  {
    path: "/Users/harshit.agrawal/workspace/scio/terraform/glean.com/internal/scio-engineering-spinnaker-pri/deploy",
    type: "spinnaker",
    allowlist: [
      "deploy-latest-qualified-version.json",
      "deploy-custom-aws.json",
      "deploy-custom-azure.json",
      // Add more files here
    ],
  },
];
```

## Step 4: Start Backend (1 minute)

```bash
cd backend
npm run dev
```

You should see:

```
Deploy Nexus Backend API running on port 3001
GitHub integration: Enabled
Spinnaker API URL: https://spinnaker.your-company.com
```

## Step 5: Update Frontend Configuration (2 minutes)

Edit `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
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

## Step 6: Add Dependencies (3 minutes)

```bash
# In root directory
npm install js-yaml
```

## Step 7: Test the Integration (2 minutes)

1. **Start the frontend**:

   ```bash
   npm run dev
   ```

2. **Open browser**: http://localhost:5173

3. **Test API**: Open browser console and run:

   ```javascript
   fetch(
     "/api/pipelines/list?path=/Users/harshit.agrawal/workspace/scio/.github/workflows"
   )
     .then((r) => r.json())
     .then(console.log);
   ```

   You should see a list of workflow files.

## Step 8: Load Pipelines in UI (Optional)

To automatically load pipelines on dashboard startup, add this to `src/components/PipelinesView.tsx`:

```typescript
import { useEffect } from "react";
import { loadAllPipelines } from "../services/pipelineLoader";

// Inside your component
useEffect(() => {
  const initializePipelines = async () => {
    try {
      const loadedPipelines = await loadAllPipelines();
      console.log("Loaded pipelines:", loadedPipelines);

      // Merge with existing pipelines
      setPipelines([...pipelines, ...loadedPipelines]);
    } catch (error) {
      console.error("Failed to load pipelines:", error);
    }
  };

  initializePipelines();
}, []);
```

## Verify It's Working

### Test 1: List Files

```bash
curl "http://localhost:3001/api/pipelines/list?path=/Users/harshit.agrawal/workspace/scio/.github/workflows"
```

Expected: JSON array of workflow files

### Test 2: Load a File

```bash
curl "http://localhost:3001/api/pipelines/load?path=/Users/harshit.agrawal/workspace/scio/.github/workflows/deploy-build-and-deploy-custom-experimental.yml"
```

Expected: YAML content of the workflow

### Test 3: Trigger a Workflow (requires GitHub token)

```bash
curl -X POST http://localhost:3001/api/github/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": "deploy-build-and-deploy-custom-experimental.yml",
    "ref": "master",
    "inputs": {
      "branch": "master",
      "operations": "ALL",
      "group": "CUSTOM",
      "scio-instance": "glean-dev",
      "platform": "google"
    }
  }'
```

Expected: Success response with workflow run details

## Troubleshooting

### Backend won't start

- Check if port 3001 is already in use: `lsof -i :3001`
- Verify all dependencies are installed: `npm install`

### Can't read files

- Check file paths are absolute and correct
- Verify you have read permissions on the directories
- Check backend logs for specific errors

### GitHub API errors

- Verify token has correct scopes
- Check token hasn't expired
- Ensure repo owner/name are correct

### Pipelines not appearing

- Check browser console for errors
- Verify backend is running
- Check allowlist in `pipelineLoader.ts`

## Next Steps

1. **Customize the UI**: Add PipelineSourceBadge to show pipeline sources
2. **Add More Pipelines**: Update the allowlist in `pipelineLoader.ts`
3. **Monitor Executions**: Implement polling for pipeline status
4. **Add RBAC**: Integrate with your access control system

## Complete Example: Adding PipelineView Integration

```typescript
// src/components/PipelinesView.tsx
import { useEffect } from "react";
import { loadAllPipelines, triggerPipeline } from "../services/pipelineLoader";
import { PipelineSourceBadge } from "./PipelineSourceBadge";

export function PipelinesView({ onEditPipeline }: PipelinesViewProps) {
  const [pipelines, setPipelines] = useState<Pipeline[]>(mockPipelines);
  const [loading, setLoading] = useState(false);

  // Load pipelines from GitHub Actions and Spinnaker
  useEffect(() => {
    const loadPipelines = async () => {
      setLoading(true);
      try {
        const loaded = await loadAllPipelines();
        setPipelines([...mockPipelines, ...loaded]);
      } catch (error) {
        console.error("Failed to load pipelines:", error);
        toast.error("Failed to load pipelines from sources");
      } finally {
        setLoading(false);
      }
    };

    loadPipelines();
  }, []);

  // Modified trigger handler
  const handleTriggerDeployment = async (
    pipeline: Pipeline,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (!validateDeploymentForm(pipeline.id)) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    const form = deploymentForms[pipeline.id];

    // Use new trigger system if pipeline has source
    if (pipeline.config?.source) {
      const parameters = {
        "scio-instance": form.scioInstance,
        operations: form.operations,
        group: form.group,
        branch: form.branch,
        extra_args: form.extraArgs,
        // Add more parameters as needed
      };

      const result = await triggerPipeline(pipeline, parameters);

      if (result.success) {
        toast.success("Pipeline triggered successfully", {
          description: `Execution ID: ${result.executionId}`,
        });
      } else {
        toast.error("Failed to trigger pipeline", {
          description: result.error,
        });
      }
    } else {
      // Original mock trigger logic
      toast.success("Deployment triggered successfully", {
        description: `${pipeline.name} v${form.version} is being deployed`,
      });
    }
  };

  // In your table, add the badge
  return (
    <Table>
      <TableBody>
        {pipelines.map((pipeline) => (
          <TableRow key={pipeline.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                {pipeline.name}
                <PipelineSourceBadge pipeline={pipeline} />
              </div>
            </TableCell>
            {/* ... rest of your table cells */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Success! 🎉

You now have a unified dashboard that can:

- ✅ Read GitHub Actions workflows
- ✅ Read Spinnaker pipelines
- ✅ Display them in a single UI
- ✅ Trigger deployments to both systems
- ✅ Monitor execution status

Total setup time: **~20 minutes**
