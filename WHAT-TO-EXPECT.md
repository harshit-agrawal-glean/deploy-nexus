# What to Expect - Visual Guide

This document shows what you should see when the Deploy Nexus Dashboard loads pipelines from GitHub Actions and Spinnaker.

## Starting the Application

### Terminal 1: Backend Server

```
$ cd backend && npm run dev

Deploy Nexus Backend API running on port 3001
GitHub integration: Disabled
Spinnaker API URL: https://spinnaker.example.com
```

### Terminal 2: Frontend

```
$ npm run dev

VITE v6.3.5  ready in 234 ms

➜  Local:   http://localhost:3000/
```

## What You'll See in the UI

### 1. Loading State

When the page first loads, you'll see:

```
┌─────────────────────────────────────────────────────────────┐
│  Deployment Pipelines                [🔄 Loading...]  [+New] │
│  Manage and execute your deployment pipelines              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Success Notification

After ~1-2 seconds, a toast notification appears:

```
✅ Loaded 4 pipeline(s) from GitHub Actions and Spinnaker
   Pipelines are now available for deployment
```

### 3. Pipeline List with Source Badges

The pipelines table will now show:

```
┌────────────────────────────────────────────────────────────────────────────┐
│ 📍 Pipeline Name                                 Status    Last Run  Actions│
├────────────────────────────────────────────────────────────────────────────┤
│ > Deploy to Production                          Active    2h ago      ⋮    │
│   Standard production deployment pipeline                                   │
├────────────────────────────────────────────────────────────────────────────┤
│ > Build And Deploy Custom [GitHub Actions]     Active    Never       ⋮    │
│   GitHub Actions: Build And Deploy Custom                                  │
│   ┌────────────────────────────────────────┐                               │
│   │ 🔷 GitHub Actions                       │  ← Black badge with GitHub icon│
│   └────────────────────────────────────────┘                               │
├────────────────────────────────────────────────────────────────────────────┤
│ > Deploy Latest Qualified Version [Spinnaker] Active    Never       ⋮    │
│   Spinnaker Pipeline: Deploy Latest Qualified Version                     │
│   ┌────────────────────────────────────────┐                               │
│   │ 🔵 Spinnaker                            │  ← Blue badge with shield icon│
│   └────────────────────────────────────────┘                               │
├────────────────────────────────────────────────────────────────────────────┤
│ > Deploy Custom AWS [Spinnaker]               Active    Never       ⋮    │
│   Spinnaker Pipeline: deploy-custom-aws.json                              │
│   ┌────────────────────────────────────────┐                               │
│   │ 🔵 Spinnaker                            │                              │
│   └────────────────────────────────────────┘                               │
├────────────────────────────────────────────────────────────────────────────┤
│ > Deploy Custom Azure [Spinnaker]             Active    Never       ⋮    │
│   Spinnaker Pipeline: deploy-custom-azure.json                            │
│   ┌────────────────────────────────────────┐                               │
│   │ 🔵 Spinnaker                            │                              │
│   └────────────────────────────────────────┘                               │
└────────────────────────────────────────────────────────────────────────────┘
```

## Expanded Pipeline Row

When you click on a pipeline with source, you'll see its parameters extracted automatically:

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ▼ Build And Deploy Custom [GitHub Actions]     Active    Never       ⋮    │
│   GitHub Actions: Build And Deploy Custom                                  │
│                                                                             │
│   Trigger Deployment                                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐ │
│   │ Version: [________________]                                         │ │
│   │ Branch:  [master__________]                                         │ │
│   │                                                                     │ │
│   │ SCIO Instance: [________________] (Instance name, e.g. glean-dev)  │ │
│   │ Group:        [▼ CUSTOM        ]  (Group to deploy to)            │ │
│   │                                                                     │ │
│   │ Operations:   [▼ CUSTOM        ]  (Select operation)              │ │
│   │ Platform:     [▼ google        ]  (Deployable platform)           │ │
│   │                                                                     │ │
│   │ Extra Args:   [________________]  (Extra Arguments)               │ │
│   │                                                                     │ │
│   │ [Trigger Deployment]                                               │ │
│   └─────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   Pipeline Stages (DAG View)                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐ │
│   │    ●───────▶ ●                                                       │ │
│   │  Build    Deploy                                                     │ │
│   └─────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
```

## Spinnaker Pipeline Example

Spinnaker pipelines will show their extracted parameters:

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ▼ Deploy Latest Qualified Version [Spinnaker] Active    Never       ⋮    │
│   Spinnaker Pipeline: Deploy Latest Qualified Version                     │
│                                                                             │
│   Trigger Deployment                                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐ │
│   │ SCIO Instance: [________________] (Instances to deploy)            │ │
│   │ Operations:    [ALL___________]  (Operations to deploy) *          │ │
│   │                                                                     │ │
│   │ Allow New Major: [▼ False     ]  (Allow new major version)        │ │
│   │ Extra Args:      [________________]  (Extra arguments mapping)     │ │
│   │ DAG Name:        [▼ DEPLOY_DAG ]  (Deployment DAG name)           │ │
│   │                                                                     │ │
│   │ [Trigger Deployment]                                               │ │
│   └─────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
```

## Browser Console Output

Open DevTools (F12) and check the Console tab. You should see:

```javascript
Loaded pipelines from sources: [
  {
    id: "gh-deploy-build-and-deploy-custom-experimental",
    name: "Build And Deploy Custom",
    source: "github-actions",
    config: {
      source: "github-actions",
      sourcePath: "/Users/.../deploy-build-and-deploy-custom-experimental.yml",
      parameters: [
        { id: "branch", label: "Branch", type: "text", ... },
        { id: "operations", label: "Operations", type: "select", ... },
        ...
      ]
    }
  },
  {
    id: "sp-deploy-latest-qualified-version",
    name: "Deploy Latest Qualified Version",
    source: "spinnaker",
    config: {
      source: "spinnaker",
      sourcePath: "/Users/.../deploy-latest-qualified-version.json",
      parameters: [...]
    }
  },
  ...
]
```

## Source Badges

### GitHub Actions Badge

```
┌──────────────────┐
│ ⚫ GitHub Actions │  Black background, white text
└──────────────────┘
```

### Spinnaker Badge

```
┌──────────────┐
│ 🔵 Spinnaker │  Blue background, white text
└──────────────┘
```

### Manual Pipeline (No Badge)

Regular pipelines created through the UI won't have a badge.

## Search Functionality

The search bar works with all pipelines including loaded ones:

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Search pipelines by name or description...          │
└─────────────────────────────────────────────────────────┘

Type "github" → Shows only GitHub Actions pipelines
Type "spinnaker" → Shows only Spinnaker pipelines
Type "deploy" → Shows all matching pipelines
```

## Network Activity (DevTools → Network Tab)

When the page loads, you should see these API calls:

```
GET /api/pipelines/list?path=/Users/.../workflows
    Status: 200 OK
    Response: ["deploy-build-and-deploy-custom-experimental.yml"]

GET /api/pipelines/load?path=/Users/.../deploy-build-and-deploy-custom-experimental.yml
    Status: 200 OK
    Response: <YAML content>

GET /api/pipelines/list?path=/Users/.../deploy
    Status: 200 OK
    Response: ["deploy-latest-qualified-version.json", "deploy-custom-aws.json", ...]

GET /api/pipelines/load?path=/Users/.../deploy-latest-qualified-version.json
    Status: 200 OK
    Response: <JSON content>
```

## What Won't Work Yet (Without Tokens)

❌ **Triggering Deployments**: Clicking "Trigger Deployment" will show an error:

```
❌ Failed to trigger pipeline
   GitHub token not configured
```

❌ **Workflow Status**: Can't fetch real-time status from GitHub/Spinnaker

✅ **But You CAN**: View all pipelines, see parameters, visualize DAGs, search, filter

## Key Visual Indicators

### 1. Pipeline is from GitHub Actions

- Black badge with GitHub icon
- Description starts with "GitHub Actions:"
- Parameters match workflow inputs

### 2. Pipeline is from Spinnaker

- Blue badge with shield icon
- Description mentions "Spinnaker Pipeline:"
- Parameters match Spinnaker config

### 3. Pipeline is Manual

- No badge
- Created through the Dashboard UI
- Custom parameters

## Verification Checklist

✅ Backend running on port 3001
✅ Frontend running on port 3000
✅ Toast notification shows "Loaded X pipelines"
✅ Source badges visible (GitHub & Spinnaker)
✅ Can expand/collapse rows
✅ Parameters extracted from pipeline configs
✅ Search works with all pipelines
✅ No console errors in browser
✅ DAG visualization renders

## Expected File Counts

Based on current configuration:

- **Mock Pipelines**: 3 pipelines
- **GitHub Actions**: 1 workflow (`deploy-build-and-deploy-custom-experimental.yml`)
- **Spinnaker**: 3 pipelines (`deploy-latest-qualified-version.json`, `deploy-custom-aws.json`, `deploy-custom-azure.json`)

**Total**: 7 pipelines visible in the UI

## Troubleshooting Visual Indicators

### No badges showing?

- Check browser console for errors
- Verify `pipeline.config.source` is set
- Refresh the page

### No pipelines loading?

- Check backend terminal for errors
- Verify file paths in `pipelineLoader.ts`
- Test API endpoints manually

### Badges but wrong colors?

- Check browser's CSS cache
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Inspect element in DevTools

---

**You should now see a unified pipeline dashboard with GitHub Actions and Spinnaker pipelines side by side! 🎉**
