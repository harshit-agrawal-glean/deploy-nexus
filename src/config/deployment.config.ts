export interface ParameterOption {
  value: string;
  label: string;
}

export interface DeploymentParameter {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'boolean';
  required: boolean;
  defaultValue: string | boolean;
  placeholder?: string;
  helpText: string;
  options?: ParameterOption[];
  rows?: number;
}

export const deploymentParameters: DeploymentParameter[] = [
  {
    id: 'version',
    label: 'Version',
    type: 'text',
    required: true,
    defaultValue: '',
    placeholder: 'e.g., 2.4.1',
    helpText: 'The version number to deploy. Must follow semantic versioning (X.Y.Z format).',
  },
  {
    id: 'scioInstance',
    label: 'SCIO Instance',
    type: 'text',
    required: false,
    defaultValue: '',
    placeholder: 'e.g., prod-instance-01',
    helpText: 'Specific SCIO instance to deploy to. Leave empty to use group-based deployment.',
  },
  {
    id: 'group',
    label: 'Group',
    type: 'select',
    required: false,
    defaultValue: 'CUSTOM',
    helpText: 'Deployment group for batch deployments. Select CUSTOM for instance-specific deployment.',
    options: [
      { value: 'CUSTOM', label: 'Custom (Single Instance)' },
      { value: 'glean-customers', label: 'Glean Customers' },
      { value: 'glean-prod', label: 'Glean Production' },
      { value: 'glean-dev', label: 'Glean Development' },
      { value: 'glean-staging', label: 'Glean Staging' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    type: 'textarea',
    required: true,
    defaultValue: 'ALL',
    placeholder: 'e.g., backend-api,frontend-web,worker-service',
    helpText: 'Comma-separated list of operations/services to deploy. Use "ALL" to deploy all operations.',
    rows: 2,
  },
  {
    id: 'platform',
    label: 'Platform',
    type: 'select',
    required: true,
    defaultValue: 'all',
    helpText: 'Target cloud platform for deployment. Select "all" for multi-cloud deployment.',
    options: [
      { value: 'all', label: 'All Platforms' },
      { value: 'DP_GOOGLE', label: 'Google Cloud (GCP)' },
      { value: 'DP_AWS', label: 'Amazon Web Services (AWS)' },
      { value: 'DP_AZURE', label: 'Microsoft Azure' },
    ],
  },
  {
    id: 'branch',
    label: 'Git Branch',
    type: 'text',
    required: false,
    defaultValue: 'master',
    placeholder: 'e.g., master',
    helpText: 'Git branch to deploy from. Defaults to master branch.',
  },
  {
    id: 'allowNewMajorVersion',
    label: 'Allow New Major Version',
    type: 'select',
    required: false,
    defaultValue: 'false',
    helpText: 'Allow deployment of a new major version. Set to true to enable major version upgrades.',
    options: [
      { value: 'false', label: 'False' },
      { value: 'true', label: 'True' },
    ],
  },
  {
    id: 'postDeployValidation',
    label: 'Post Deploy Validation',
    type: 'select',
    required: false,
    defaultValue: 'false',
    helpText: 'Enable automated validation checks after deployment completes.',
    options: [
      { value: 'false', label: 'False' },
      { value: 'true', label: 'True' },
    ],
  },
  {
    id: 'soakTimeMinutes',
    label: 'Soak Time (Minutes)',
    type: 'text',
    required: false,
    defaultValue: '0',
    placeholder: 'e.g., 30',
    helpText: 'Time in minutes to wait and monitor the deployment before marking it as successful. 0 means no soak time.',
  },
  {
    id: 'deployOrchestratorMode',
    label: 'Deploy Orchestrator Mode',
    type: 'select',
    required: false,
    defaultValue: 'REGULAR',
    helpText: 'Mode for the deployment orchestrator. REGULAR for standard deployments, CANARY for gradual rollouts.',
    options: [
      { value: 'REGULAR', label: 'Regular' },
      { value: 'CANARY', label: 'Canary' },
      { value: 'BLUE_GREEN', label: 'Blue-Green' },
    ],
  },
  {
    id: 'dagName',
    label: 'DAG Name',
    type: 'select',
    required: false,
    defaultValue: '',
    helpText: 'Optional: Select a specific Directed Acyclic Graph (DAG) configuration for the deployment workflow.',
    options: [
      { value: '', label: 'None (Use Default)' },
      { value: 'standard-deploy', label: 'Standard Deploy' },
      { value: 'fast-deploy', label: 'Fast Deploy' },
      { value: 'safe-deploy', label: 'Safe Deploy with Validations' },
    ],
  },
  {
    id: 'extraArgs',
    label: 'Extra Arguments',
    type: 'textarea',
    required: false,
    defaultValue: '',
    placeholder: 'e.g., pipeline=quality,foo=bar',
    helpText: 'Additional key-value pairs for advanced deployment configuration. Format: key1=value1,key2=value2',
    rows: 2,
  },
  {
    id: 'slackNotification',
    label: 'Slack Notification',
    type: 'select',
    required: false,
    defaultValue: 'True',
    helpText: 'Send deployment notifications to configured Slack channels.',
    options: [
      { value: 'True', label: 'Enabled' },
      { value: 'False', label: 'Disabled' },
    ],
  },
];

