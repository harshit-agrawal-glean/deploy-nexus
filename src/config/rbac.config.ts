/**
 * RBAC Configuration File
 * 
 * This file defines group-based access control for Deploy Nexus pipelines.
 * 
 * IMPORTANT: This configuration is READ-ONLY in the UI.
 * Any changes to groups or pipeline access must be made through this config file
 * and go through proper code review process.
 * 
 * Authentication: Google Identity Provider
 * Authorization: Google Groups for access control
 * 
 * Last Modified: November 5, 2025
 */

import { AccessGroup, PipelineAccessControl } from '../types';

// ============================================================================
// ACCESS GROUPS
// ============================================================================
// These groups should match your Google Groups for Identity Provider integration

export const ACCESS_GROUPS: AccessGroup[] = [
  {
    id: 'platform-admins',
    name: 'Platform Administrators',
    description: 'Full access to all pipelines and system administration',
    email: 'platform-admins@company.com',
    permissions: [
      'pipelines.*.view',
      'pipelines.*.edit',
      'pipelines.*.delete',
      'pipelines.*.trigger',
      'environments.*.deploy',
      'system.admin',
    ],
  },
  {
    id: 'backend-engineers',
    name: 'Backend Engineering Team',
    description: 'Backend services and API deployment access',
    email: 'backend-engineers@company.com',
    permissions: [
      'pipelines.backend-*.view',
      'pipelines.backend-*.edit',
      'pipelines.backend-*.trigger',
      'environments.dev.deploy',
      'environments.staging.deploy',
      'environments.production.deploy',
    ],
  },
  {
    id: 'frontend-engineers',
    name: 'Frontend Engineering Team',
    description: 'Frontend and web application deployment access',
    email: 'frontend-engineers@company.com',
    permissions: [
      'pipelines.frontend-*.view',
      'pipelines.frontend-*.edit',
      'pipelines.frontend-*.trigger',
      'environments.dev.deploy',
      'environments.staging.deploy',
      'environments.production.deploy',
    ],
  },
  {
    id: 'data-engineers',
    name: 'Data Engineering Team',
    description: 'Data pipeline and ETL deployment access',
    email: 'data-engineers@company.com',
    permissions: [
      'pipelines.data-*.view',
      'pipelines.data-*.edit',
      'pipelines.data-*.trigger',
      'environments.dev.deploy',
      'environments.staging.deploy',
    ],
  },
  {
    id: 'qa-team',
    name: 'QA & Testing Team',
    description: 'Testing environment deployment access',
    email: 'qa-team@company.com',
    permissions: [
      'pipelines.*.view',
      'pipelines.*.trigger',
      'environments.qa.deploy',
      'environments.staging.deploy',
    ],
  },
  {
    id: 'devops-team',
    name: 'DevOps & SRE Team',
    description: 'Infrastructure and deployment pipeline management',
    email: 'devops-team@company.com',
    permissions: [
      'pipelines.*.view',
      'pipelines.*.edit',
      'pipelines.*.trigger',
      'environments.*.deploy',
      'system.monitor',
    ],
  },
  {
    id: 'release-managers',
    name: 'Release Management Team',
    description: 'Production release approval and deployment',
    email: 'release-managers@company.com',
    permissions: [
      'pipelines.*.view',
      'pipelines.*.trigger',
      'environments.production.deploy',
      'deployments.approve',
    ],
  },
  {
    id: 'readonly-viewers',
    name: 'Read-Only Viewers',
    description: 'View-only access to pipelines and deployments',
    email: 'readonly-viewers@company.com',
    permissions: [
      'pipelines.*.view',
      'deployments.view',
      'logs.view',
    ],
  },
];

// ============================================================================
// PIPELINE ACCESS CONTROL MAPPINGS
// ============================================================================
// Define which groups have access to which pipelines and environments

export const PIPELINE_ACCESS_MAPPINGS: PipelineAccessControl[] = [
  {
    pipelineId: '1',
    pipelineName: 'API Gateway Deployment',
    allowedGroups: {
      view: ['platform-admins', 'backend-engineers', 'devops-team', 'qa-team', 'readonly-viewers'],
      trigger: ['platform-admins', 'backend-engineers', 'devops-team'],
      edit: ['platform-admins', 'backend-engineers', 'devops-team'],
      delete: ['platform-admins'],
    },
    environments: {
      development: ['platform-admins', 'backend-engineers', 'devops-team', 'qa-team'],
      staging: ['platform-admins', 'backend-engineers', 'devops-team', 'qa-team'],
      production: ['platform-admins', 'backend-engineers', 'release-managers'],
    },
  },
  {
    pipelineId: '2',
    pipelineName: 'Web Dashboard Release',
    allowedGroups: {
      view: ['platform-admins', 'frontend-engineers', 'devops-team', 'qa-team', 'readonly-viewers'],
      trigger: ['platform-admins', 'frontend-engineers', 'devops-team'],
      edit: ['platform-admins', 'frontend-engineers', 'devops-team'],
      delete: ['platform-admins'],
    },
    environments: {
      development: ['platform-admins', 'frontend-engineers', 'devops-team', 'qa-team'],
      staging: ['platform-admins', 'frontend-engineers', 'devops-team', 'qa-team'],
      production: ['platform-admins', 'frontend-engineers', 'release-managers'],
    },
  },
  {
    pipelineId: '3',
    pipelineName: 'Mobile App Build',
    allowedGroups: {
      view: ['platform-admins', 'frontend-engineers', 'devops-team', 'qa-team', 'readonly-viewers'],
      trigger: ['platform-admins', 'frontend-engineers', 'devops-team', 'qa-team'],
      edit: ['platform-admins', 'frontend-engineers', 'devops-team'],
      delete: ['platform-admins'],
    },
    environments: {
      development: ['platform-admins', 'frontend-engineers', 'devops-team', 'qa-team'],
      qa: ['platform-admins', 'frontend-engineers', 'qa-team'],
      staging: ['platform-admins', 'frontend-engineers', 'devops-team'],
      production: ['platform-admins', 'release-managers'],
    },
  },
  {
    pipelineId: '4',
    pipelineName: 'Data Processing Pipeline',
    allowedGroups: {
      view: ['platform-admins', 'data-engineers', 'devops-team', 'readonly-viewers'],
      trigger: ['platform-admins', 'data-engineers', 'devops-team'],
      edit: ['platform-admins', 'data-engineers', 'devops-team'],
      delete: ['platform-admins'],
    },
    environments: {
      development: ['platform-admins', 'data-engineers', 'devops-team'],
      staging: ['platform-admins', 'data-engineers', 'devops-team'],
      production: ['platform-admins', 'data-engineers'],
    },
  },
  {
    pipelineId: '5',
    pipelineName: 'Microservices Orchestration',
    allowedGroups: {
      view: ['platform-admins', 'backend-engineers', 'devops-team', 'qa-team', 'readonly-viewers'],
      trigger: ['platform-admins', 'backend-engineers', 'devops-team'],
      edit: ['platform-admins', 'backend-engineers', 'devops-team'],
      delete: ['platform-admins'],
    },
    environments: {
      development: ['platform-admins', 'backend-engineers', 'devops-team', 'qa-team'],
      staging: ['platform-admins', 'backend-engineers', 'devops-team', 'qa-team'],
      production: ['platform-admins', 'backend-engineers', 'release-managers'],
    },
  },
  {
    pipelineId: '6',
    pipelineName: 'Infrastructure as Code',
    allowedGroups: {
      view: ['platform-admins', 'devops-team', 'readonly-viewers'],
      trigger: ['platform-admins', 'devops-team'],
      edit: ['platform-admins', 'devops-team'],
      delete: ['platform-admins'],
    },
    environments: {
      development: ['platform-admins', 'devops-team'],
      staging: ['platform-admins', 'devops-team'],
      production: ['platform-admins', 'devops-team'],
    },
  },
];

// ============================================================================
// ENVIRONMENT-LEVEL ACCESS CONTROL
// ============================================================================
// Global environment access policies

export const ENVIRONMENT_ACCESS: Record<string, string[]> = {
  development: ['platform-admins', 'backend-engineers', 'frontend-engineers', 'data-engineers', 'devops-team', 'qa-team'],
  qa: ['platform-admins', 'frontend-engineers', 'devops-team', 'qa-team'],
  staging: ['platform-admins', 'backend-engineers', 'frontend-engineers', 'data-engineers', 'devops-team', 'qa-team'],
  production: ['platform-admins', 'backend-engineers', 'frontend-engineers', 'data-engineers', 'devops-team', 'release-managers'],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a group has access to a specific pipeline action
 */
export function hasGroupAccess(
  groupId: string,
  pipelineId: string,
  action: 'view' | 'trigger' | 'edit' | 'delete'
): boolean {
  const mapping = PIPELINE_ACCESS_MAPPINGS.find((m) => m.pipelineId === pipelineId);
  return mapping ? mapping.allowedGroups[action].includes(groupId) : false;
}

/**
 * Check if a group can deploy to a specific environment for a pipeline
 */
export function canDeployToEnvironment(
  groupId: string,
  pipelineId: string,
  environment: string
): boolean {
  const mapping = PIPELINE_ACCESS_MAPPINGS.find((m) => m.pipelineId === pipelineId);
  return mapping ? (mapping.environments[environment]?.includes(groupId) ?? false) : false;
}

/**
 * Get all pipelines accessible by a group
 */
export function getPipelinesForGroup(groupId: string, action: 'view' | 'trigger' | 'edit' | 'delete'): string[] {
  return PIPELINE_ACCESS_MAPPINGS
    .filter((mapping) => mapping.allowedGroups[action].includes(groupId))
    .map((mapping) => mapping.pipelineId);
}

/**
 * Get all groups that can access a pipeline
 */
export function getGroupsForPipeline(pipelineId: string): AccessGroup[] {
  const mapping = PIPELINE_ACCESS_MAPPINGS.find((m) => m.pipelineId === pipelineId);
  if (!mapping) return [];
  
  const allGroupIds = new Set([
    ...mapping.allowedGroups.view,
    ...mapping.allowedGroups.trigger,
    ...mapping.allowedGroups.edit,
    ...mapping.allowedGroups.delete,
  ]);
  
  return ACCESS_GROUPS.filter((group) => allGroupIds.has(group.id));
}
