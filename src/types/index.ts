export type UserRole = 'admin' | 'engineer' | 'qa' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AccessGroup {
  id: string;
  name: string;
  description: string;
  email: string; // Google Group email
  permissions: string[];
}

export interface PipelineAccessControl {
  pipelineId: string;
  pipelineName: string;
  allowedGroups: {
    view: string[];      // Group IDs that can view
    trigger: string[];   // Group IDs that can trigger deployments
    edit: string[];      // Group IDs that can edit pipeline
    delete: string[];    // Group IDs that can delete pipeline
  };
  environments: {
    [env: string]: string[]; // Group IDs per environment
  };
}

export interface PipelineParameter {
  id: string;
  label: string;
  helpText: string;  // Renamed from 'description' to match ParameterField component
  type: 'text' | 'select' | 'textarea' | 'boolean';
  required: boolean;
  defaultValue: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface PipelineConfig {
  scio_instance?: string;
  group?: string;
  owner?: string;
  slack_channel?: string;
  notification_emails?: string[];
  auto_rollback?: boolean;
  approval_required?: boolean;
  timeout_minutes?: number;
  max_retries?: number;
  // Non-editable configs
  created_date?: string;
  last_modified?: string;
  version?: string;
  pipeline_id?: string;
  // Source information
  source?: 'github-actions' | 'spinnaker' | 'manual';
  sourcePath?: string;
  parameters?: PipelineParameter[];
  rawDefinition?: any;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  environments?: string[]; // Optional - deprecated in favor of config-based deployment
  stages: Stage[];
  createdBy: string;
  createdAt: Date;
  lastDeployed?: Date;
  status: 'active' | 'inactive';
  pinned?: boolean;
  config?: PipelineConfig;
}

export interface Stage {
  id: string;
  name: string;
  type: 'build' | 'test' | 'deploy' | 'approval' | 'notification';
  config: Record<string, any>;
  order: number;
  depends_on?: string[]; // Array of stage IDs this stage depends on
}

export interface Deployment {
  id: string;
  pipelineId: string;
  pipelineName: string;
  environment?: string; // Optional - deprecated, no longer displayed
  version: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  triggeredBy: string;
  triggeredAt: Date;
  completedAt?: Date;
  duration?: number;
  logs?: string[];
}

export interface RBACPermission {
  resource: string;
  actions: string[];
}
