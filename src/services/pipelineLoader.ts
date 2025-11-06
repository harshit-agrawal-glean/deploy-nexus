import { ParsedPipeline, parseGitHubActionsWorkflow, parseSpinnakerPipeline, toDashboardPipeline } from './pipelineParser';
import { Pipeline } from '../types';

export interface PipelineDirectory {
  path: string;
  type: 'github-actions' | 'spinnaker';
  allowlist?: string[]; // Optional: only load specific files
}

/**
 * Configuration for pipeline sources
 */
export const PIPELINE_SOURCES: PipelineDirectory[] = [
  {
    path: '/Users/harshit.agrawal/workspace/scio/.github/workflows',
    type: 'github-actions',
    allowlist: [
      'deploy-build-and-deploy-custom-experimental.yml',
      // Add more allowlisted workflows here
    ],
  },
  {
    path: '/Users/harshit.agrawal/workspace/scio/terraform/glean.com/internal/scio-engineering-spinnaker-pri/deploy',
    type: 'spinnaker',
    allowlist: [
      'deploy-latest-qualified-version.json',
      'deploy-custom-aws.json',
      'deploy-custom-azure.json',
      'build-deploy-custom-new.json',
      // Add more allowlisted pipelines here
    ],
  },
];

/**
 * Load a single pipeline file
 */
export async function loadPipelineFile(
  filePath: string,
  type: 'github-actions' | 'spinnaker'
): Promise<ParsedPipeline | null> {
  try {
    // In a real implementation, you would use Node.js fs module or a backend API
    // For now, this is a placeholder that shows the structure
    const response = await fetch(`/api/pipelines/load?path=${encodeURIComponent(filePath)}`);
    
    if (!response.ok) {
      console.error(`Failed to load pipeline: ${filePath}`);
      return null;
    }

    const content = await response.text();

    if (type === 'github-actions') {
      return parseGitHubActionsWorkflow(content, filePath);
    } else {
      return parseSpinnakerPipeline(content, filePath);
    }
  } catch (error) {
    console.error(`Error loading pipeline ${filePath}:`, error);
    return null;
  }
}

/**
 * Load all pipelines from configured directories
 */
export async function loadAllPipelines(): Promise<Pipeline[]> {
  const pipelines: Pipeline[] = [];

  for (const source of PIPELINE_SOURCES) {
    try {
      // Get list of files in directory
      const response = await fetch(`/api/pipelines/list?path=${encodeURIComponent(source.path)}`);
      
      if (!response.ok) {
        console.error(`Failed to list files in: ${source.path}`);
        continue;
      }

      const files: string[] = await response.json();

      // Filter by allowlist if provided
      const filesToLoad = source.allowlist
        ? files.filter(file => source.allowlist!.includes(file))
        : files;

      // Load each file
      for (const file of filesToLoad) {
        const fullPath = `${source.path}/${file}`;
        const parsed = await loadPipelineFile(fullPath, source.type);
        
        if (parsed) {
          const pipeline = toDashboardPipeline(parsed);
          pipelines.push(pipeline);
        }
      }
    } catch (error) {
      console.error(`Error loading pipelines from ${source.path}:`, error);
    }
  }

  return pipelines;
}

/**
 * Trigger a pipeline execution
 */
export async function triggerPipeline(
  pipeline: Pipeline,
  parameters: Record<string, any>
): Promise<{ success: boolean; executionId?: string; error?: string }> {
  try {
    const source = pipeline.config?.source;
    
    if (source === 'github-actions') {
      return await triggerGitHubActionsWorkflow(pipeline, parameters);
    } else if (source === 'spinnaker') {
      return await triggerSpinnakerPipeline(pipeline, parameters);
    }

    return { success: false, error: 'Unknown pipeline source' };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Trigger GitHub Actions workflow
 */
async function triggerGitHubActionsWorkflow(
  pipeline: Pipeline,
  parameters: Record<string, any>
): Promise<{ success: boolean; executionId?: string; error?: string }> {
  try {
    // Extract workflow file name from source path
    const workflowFile = pipeline.config?.sourcePath?.split('/').pop();

    const response = await fetch('/api/github/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflow: workflowFile,
        ref: 'master', // or get from parameters
        inputs: parameters,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const result = await response.json();
    return { success: true, executionId: result.run_id };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Trigger Spinnaker pipeline
 */
async function triggerSpinnakerPipeline(
  pipeline: Pipeline,
  parameters: Record<string, any>
): Promise<{ success: boolean; executionId?: string; error?: string }> {
  try {
    const response = await fetch('/api/spinnaker/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application: 'deploy', // or get from pipeline config
        pipelineName: pipeline.name,
        parameters,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const result = await response.json();
    return { success: true, executionId: result.executionId };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

