# Deploy Nexus Dashboard - Pipeline Integration

> **Unified deployment interface for GitHub Actions and Spinnaker pipelines**

## 🎯 Overview

The Deploy Nexus Dashboard now provides a **single unified interface** to view and trigger deployments across both GitHub Actions and Spinnaker. Engineers, QA, and other stakeholders can interact with all deployment systems through one consistent UI.

## ✨ Key Features

- 📋 **Unified Pipeline List** - View all pipelines from multiple sources in one place
- 🏷️ **Source Badges** - Visual indicators showing pipeline origin (GitHub/Spinnaker)
- 🔄 **Auto-Discovery** - Automatically loads pipelines from configured directories
- 📝 **Dynamic Forms** - Parameters extracted automatically from pipeline definitions
- 🌐 **DAG Visualization** - Visual representation of pipeline stages and dependencies
- 🔍 **Search & Filter** - Find pipelines quickly across all sources
- 🚀 **Ready to Scale** - Easy to add more pipeline sources

## 📁 Project Structure

```
Deploy Nexus Dashboard/
├── backend/
│   ├── server.ts              # Express API server
│   ├── package.json           # Backend dependencies
│   └── (node_modules/)
├── src/
│   ├── services/
│   │   ├── pipelineParser.ts  # Parse GH Actions & Spinnaker
│   │   └── pipelineLoader.ts  # Load & trigger pipelines
│   ├── components/
│   │   ├── PipelinesView.tsx          # Main pipeline list (updated)
│   │   └── PipelineSourceBadge.tsx    # Source indicator badges
│   └── types/
│       └── index.ts           # Updated with pipeline types
├── START-HERE.md              # Quick start guide
├── SETUP-COMPLETE.md          # Setup summary
├── WHAT-TO-EXPECT.md          # Visual guide
├── PIPELINE-INTEGRATION.md    # Detailed docs
└── QUICK-START-INTEGRATION.md # 20-min setup guide
```

## 🚀 Quick Start

### Step 1: Start Backend Server

```bash
cd "/Users/harshit.agrawal/Downloads/Deploy Nexus Dashboard/backend"
npm run dev
```

Expected output:

```
Deploy Nexus Backend API running on port 3001
GitHub integration: Disabled
Spinnaker API URL: https://spinnaker.example.com
```

### Step 2: Start Frontend

In a **new terminal**:

```bash
cd "/Users/harshit.agrawal/Downloads/Deploy Nexus Dashboard"
npm run dev
```

Browser opens at: `http://localhost:3000`

### Step 3: View Pipelines

1. Navigate to the **Pipelines** tab
2. Look for pipelines with source badges:
   - ⚫ **GitHub Actions** (black badge)
   - 🔵 **Spinnaker** (blue badge)
3. A toast notification will show: "Loaded X pipeline(s) from GitHub Actions and Spinnaker"

## 📊 What's Configured

### GitHub Actions Workflows

**Path**: `/Users/harshit.agrawal/workspace/scio/.github/workflows`

**Loaded Files**:

- `deploy-build-and-deploy-custom-experimental.yml`

**Total Available**: 100+ workflow files (only allowlisted ones are loaded)

### Spinnaker Pipelines

**Path**: `/Users/harshit.agrawal/workspace/scio/terraform/glean.com/internal/scio-engineering-spinnaker-pri/deploy`

**Loaded Files**:

- `deploy-latest-qualified-version.json`
- `deploy-custom-aws.json`
- `deploy-custom-azure.json`

**Total Available**: 40+ pipeline files (only allowlisted ones are loaded)

## 🎨 UI Features

### Source Badges

Each pipeline displays a badge indicating its source:

| Badge              | Meaning                       | Color                  |
| ------------------ | ----------------------------- | ---------------------- |
| **GitHub Actions** | Loaded from .github/workflows | Black with GitHub logo |
| **Spinnaker**      | Loaded from Spinnaker configs | Blue with shield icon  |
| (no badge)         | Created manually in UI        | -                      |

### Dynamic Parameters

Parameters are automatically extracted from pipeline definitions:

**GitHub Actions Example**:

```yaml
# From workflow file
inputs:
  branch:
    description: "Branch to use"
    default: "master"
  operations:
    type: choice
    options: ["ALL", "CUSTOM"]
```

**Becomes** → Form fields in the UI with proper types and defaults!

**Spinnaker Example**:

```json
{
  "parameterConfig": [
    {
      "name": "scio_instance",
      "description": "Instances to deploy",
      "required": false,
      "default": ""
    }
  ]
}
```

**Becomes** → Form field with description and default value!

## 🔧 Configuration

### Adding More Pipelines

Edit `src/services/pipelineLoader.ts`:

```typescript
export const PIPELINE_SOURCES: PipelineDirectory[] = [
  {
    path: "/Users/.../workspace/scio/.github/workflows",
    type: "github-actions",
    allowlist: [
      "deploy-build-and-deploy-custom-experimental.yml",
      "your-new-workflow.yml", // ← Add this
    ],
  },
  {
    path: "/Users/.../scio-engineering-spinnaker-pri/deploy",
    type: "spinnaker",
    allowlist: [
      "deploy-latest-qualified-version.json",
      "your-new-pipeline.json", // ← Add this
    ],
  },
];
```

Restart the frontend → New pipelines appear automatically! 🎉

### Configuring Different Paths

To use different directories:

1. Edit `PIPELINE_SOURCES` in `src/services/pipelineLoader.ts`
2. Update `path` to your directory
3. Add files to `allowlist`
4. Restart the frontend

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:3001/health

# List workflows
curl "http://localhost:3001/api/pipelines/list?path=/Users/harshit.agrawal/workspace/scio/.github/workflows"

# Load a workflow
curl "http://localhost:3001/api/pipelines/load?path=/Users/.../deploy-build-and-deploy-custom-experimental.yml"
```

### Test Frontend

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for: `Loaded pipelines from sources: [...]`
4. Check Network tab for API calls to `/api/pipelines/*`

## 📈 Current Status

### ✅ Working Now (No Tokens Required)

- Load pipelines from GitHub Actions
- Load pipelines from Spinnaker
- Display source badges
- Extract parameters automatically
- Visualize pipeline stages (DAG)
- Search and filter pipelines
- View pipeline details
- Expand deployment forms

### ⏳ Not Yet Working (Requires Tokens)

- Trigger GitHub Actions workflows (needs `GITHUB_TOKEN`)
- Trigger Spinnaker pipelines (needs `SPINNAKER_API_URL` configured)
- Fetch real-time execution status
- Display deployment logs

## 🔐 Enabling Pipeline Triggering (Optional)

### For GitHub Actions

1. Generate a GitHub Personal Access Token

   - Go to https://github.com/settings/tokens
   - Create token with `repo` and `workflow` scopes

2. Create `backend/.env`:

   ```bash
   GITHUB_TOKEN=ghp_your_token_here
   GITHUB_OWNER=your-org
   GITHUB_REPO=scio
   ```

3. Restart backend

Now you can trigger workflows from the UI! 🚀

### For Spinnaker

1. Add to `backend/.env`:

   ```bash
   SPINNAKER_API_URL=https://spinnaker.your-company.com
   ```

2. Restart backend

Now you can trigger Spinnaker pipelines! 🚀

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│   Frontend (React + Vite)      │
│   Port: 3000                    │
│                                 │
│   - PipelinesView               │
│   - PipelineSourceBadge         │
│   - pipelineLoader              │
│   - pipelineParser              │
└────────────┬────────────────────┘
             │
             │ HTTP Proxy: /api → :3001
             │
┌────────────▼────────────────────┐
│   Backend (Express + Node.js)   │
│   Port: 3001                    │
│                                 │
│   Endpoints:                    │
│   - GET /api/pipelines/list     │
│   - GET /api/pipelines/load     │
│   - POST /api/github/trigger    │
│   - POST /api/spinnaker/trigger │
└────────────┬────────────────────┘
             │
    ┌────────┴─────────┐
    │                  │
┌───▼──────────┐  ┌────▼────────┐
│  File System │  │   External  │
│              │  │   APIs      │
│ - workflows/ │  │             │
│ - deploy/    │  │ - GitHub    │
└──────────────┘  │ - Spinnaker │
                  └─────────────┘
```

## 📚 Documentation

| File                         | Purpose                      | Audience   |
| ---------------------------- | ---------------------------- | ---------- |
| `START-HERE.md`              | Quick start to run the app   | Everyone   |
| `WHAT-TO-EXPECT.md`          | Visual guide of the UI       | Everyone   |
| `SETUP-COMPLETE.md`          | Summary of installation      | Developers |
| `PIPELINE-INTEGRATION.md`    | Technical deep dive          | Developers |
| `QUICK-START-INTEGRATION.md` | Step-by-step setup           | Developers |
| This file                    | Overview and quick reference | Everyone   |

## 🐛 Troubleshooting

### Backend won't start

**Problem**: Port 3001 already in use

**Solution**:

```bash
lsof -i :3001
kill -9 <PID>
npm run dev
```

### No pipelines showing

**Check**:

1. ✅ Backend is running on port 3001
2. ✅ Paths in `pipelineLoader.ts` are correct
3. ✅ Files exist at those paths
4. ✅ Browser console shows no errors

**Test**:

```bash
# Should return JSON array
curl "http://localhost:3001/api/pipelines/list?path=/Users/harshit.agrawal/workspace/scio/.github/workflows"
```

### Badges not showing

**Try**:

1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Check browser console for errors
3. Verify `pipeline.config.source` exists in loaded pipelines

### Files not found

**Verify paths**:

```bash
ls "/Users/harshit.agrawal/workspace/scio/.github/workflows"
ls "/Users/harshit.agrawal/workspace/scio/terraform/glean.com/internal/scio-engineering-spinnaker-pri/deploy"
```

## 🎯 Benefits

### For Engineers

- ✅ One interface for all deployment systems
- ✅ No need to remember which pipeline lives where
- ✅ Consistent UX across GitHub Actions and Spinnaker
- ✅ Quick access to deployment parameters

### For QA

- ✅ Easy to find and trigger test deployments
- ✅ Clear visibility into pipeline parameters
- ✅ No need to learn multiple systems

### For Managers

- ✅ Centralized deployment tracking
- ✅ Unified audit trail
- ✅ Better visibility into deployment activity

### For Operations

- ✅ Single point of monitoring
- ✅ Easier to implement access controls
- ✅ Simplified onboarding for new team members

## 🚀 Future Enhancements

Potential future additions:

- [ ] Real-time execution status updates
- [ ] Deployment approval workflows
- [ ] Rollback capabilities
- [ ] Pipeline execution logs display
- [ ] Custom parameter validators
- [ ] Pipeline templates
- [ ] Scheduled deployments
- [ ] Slack integration for notifications
- [ ] More pipeline sources (Jenkins, GitLab CI, etc.)

## 📊 Metrics

After setup:

- **Pipeline Sources**: 2 (GitHub Actions + Spinnaker)
- **Available Workflows**: 100+ (GitHub Actions)
- **Available Pipelines**: 40+ (Spinnaker)
- **Currently Loaded**: 4 pipelines (1 GH + 3 Spinnaker)
- **Lines of Code**: ~1,500 new lines
- **Setup Time**: ~20 minutes
- **Dependencies Added**: 4 (js-yaml, @octokit/rest, express, cors)

## 🤝 Contributing

To add support for more pipeline sources:

1. Create a parser in `pipelineParser.ts`
2. Add loader logic in `pipelineLoader.ts`
3. Update `PIPELINE_SOURCES` configuration
4. Add source badge in `PipelineSourceBadge.tsx`
5. Update documentation

## 📝 License

Same as the main Deploy Nexus Dashboard project.

## 🙋 Support

For questions or issues:

1. Check documentation files in this directory
2. Review browser console for errors
3. Check backend terminal output
4. Test API endpoints manually with curl

---

**Built with ❤️ to simplify deployments across multiple systems**

🎉 **Enjoy your unified deployment dashboard!** 🎉
