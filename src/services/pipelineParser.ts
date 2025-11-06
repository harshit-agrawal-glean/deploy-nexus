import yaml from 'js-yaml';
import { Pipeline, Stage } from '../types';

export type PipelineSource = 'github-actions' | 'spinnaker';

export interface ParsedPipeline {
  id: string;
  name: string;
  description: string;
  source: PipelineSource;
  sourcePath: string;
  parameters: PipelineParameter[];
  rawDefinition: any;
}

export interface PipelineParameter {
  id: string;
  label: string;
  helpText: string;  // Changed from 'description' to match ParameterField interface
  type: 'text' | 'select' | 'textarea' | 'boolean';
  required: boolean;
  defaultValue: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

/**
 * Parse GitHub Actions workflow file
 */
export function parseGitHubActionsWorkflow(content: string, filePath: string): ParsedPipeline {
  const workflow = yaml.load(content) as any;
  
  const inputs = workflow.on?.workflow_dispatch?.inputs || {};
  const parameters: PipelineParameter[] = [];

  for (const [key, input] of Object.entries(inputs as Record<string, any>)) {
    const param: PipelineParameter = {
      id: key,
      label: key.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      helpText: input.description || '',
      type: input.type === 'choice' ? 'select' : 'text',
      required: input.required ?? false,
      defaultValue: input.default || '',
      placeholder: input.description ? `e.g., ${input.default || '...'}` : undefined,
    };

    if (input.type === 'choice' && input.options) {
      param.options = input.options.map((opt: string) => ({
        value: opt,
        label: opt,
      }));
    }

    parameters.push(param);
  }

  return {
    id: `gh-${filePath.split('/').pop()?.replace('.yml', '')}`,
    name: workflow.name || 'GitHub Actions Workflow',
    description: `GitHub Actions: ${workflow.name}`,
    source: 'github-actions',
    sourcePath: filePath,
    parameters,
    rawDefinition: workflow,
  };
}

/**
 * Parse Spinnaker pipeline file
 */
export function parseSpinnakerPipeline(content: string, filePath: string): ParsedPipeline {
  const pipeline = JSON.parse(content);
  
  const parameterConfig = pipeline.parameterConfig || [];
  const parameters: PipelineParameter[] = parameterConfig.map((param: any) => {
    const parameter: PipelineParameter = {
      id: param.name,
      label: param.label || param.name.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      helpText: param.description || '',
      type: param.hasOptions ? 'select' : 'text',
      required: param.required ?? false,
      defaultValue: param.default || '',
      placeholder: param.description ? `e.g., ${param.default || '...'}` : undefined,
    };

    if (param.hasOptions && param.options) {
      parameter.options = param.options
        .map((opt: any) => ({
          value: typeof opt === 'string' ? opt : opt.value,
          label: typeof opt === 'string' ? opt : (opt.label || opt.value),
        }))
        .filter((opt) => opt.value !== ''); // Filter out empty string values
    }

    return parameter;
  });

  // Extract stages from Spinnaker pipeline
  const stages = pipeline.stages || [];

  return {
    id: `sp-${filePath.split('/').pop()?.replace('.json', '')}`,
    name: pipeline.name || filePath.split('/').pop()?.replace('.json', '').replace(/-/g, ' '),
    description: `Spinnaker Pipeline: ${pipeline.description || pipeline.name || ''}`,
    source: 'spinnaker',
    sourcePath: filePath,
    parameters,
    rawDefinition: pipeline,
  };
}

/**
 * Convert parsed pipeline to Dashboard Pipeline format
 */
export function toDashboardPipeline(parsed: ParsedPipeline): Pipeline {
  // Generate stages based on source
  const stages: Stage[] = parsed.source === 'spinnaker' && parsed.rawDefinition.stages
    ? parsed.rawDefinition.stages.map((stage: any, index: number) => ({
        id: stage.refId || `stage-${index}`,
        name: stage.name || stage.type || `Stage ${index + 1}`,
        type: stage.type || 'deploy',
        config: stage,
        order: index + 1,
        depends_on: stage.requisiteStageRefIds || [],
      }))
    : [
        {
          id: 'stage-1',
          name: parsed.source === 'github-actions' ? 'GitHub Actions Workflow' : 'Execute',
          type: 'deploy',
          config: {},
          order: 1,
          depends_on: [],
        },
      ];

  return {
    id: parsed.id,
    name: parsed.name,
    description: parsed.description,
    environments: [],
    stages,
    createdBy: 'System',
    createdAt: new Date(),
    status: 'active',
    config: {
      source: parsed.source,
      sourcePath: parsed.sourcePath,
      parameters: parsed.parameters,
      rawDefinition: parsed.rawDefinition,
    },
  };
}

