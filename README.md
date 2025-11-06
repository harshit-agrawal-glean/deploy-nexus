# Deploy Nexus Dashboard

This is a code bundle for Deploy Nexus Dashboard. The original project is available at https://www.figma.com/design/jBjpFvAkQcdHSCYzQ3fPE3/Deploy-Nexus-Dashboard.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Features

### Pipeline Management

- **Create/Edit Pipelines**: Manually configure pipeline stages or import from config files
- **Config File Import**: Upload JSON config files (Spinnaker-compatible) to automatically create pipelines
- **DAG Visualization**: Visualize pipeline stages as a directed acyclic graph based on dependencies
- **Stage Dependencies**: Define "depends_on" relationships between stages for complex workflows

### Pipeline Configuration

The application supports importing pipeline configurations in JSON format. A sample config file (`sample-pipeline-config.json`) is included in the project root.

Example config structure:

```json
{
  "name": "Pipeline Name",
  "description": "Pipeline description",
  "stages": [
    {
      "name": "Stage Name",
      "refId": "stage-id",
      "requisiteStageRefIds": ["dependency-stage-id"],
      "type": "deploy"
    }
  ]
}
```

### Deployment

- **Trigger Deployments**: Deploy pipelines with customizable parameters
- **Version Control**: Specify versions and git branches
- **SCIO Instance/Group**: Target specific SCIO instances or deployment groups
- **Extra Arguments**: Pass additional arguments for advanced deployment scenarios
