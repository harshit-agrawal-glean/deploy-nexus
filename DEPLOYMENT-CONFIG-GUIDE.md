# Deployment Configuration Guide

This project uses a **config-driven approach** for deployment parameters, allowing you to easily modify, add, or remove parameters without touching component code.

## Configuration File

All deployment parameters are defined in:

```
src/config/deployment.config.ts
```

## Adding a New Parameter

To add a new deployment parameter, simply add it to the `deploymentParameters` array:

```typescript
{
  id: 'myNewParameter',
  label: 'My New Parameter',
  type: 'text', // or 'textarea', 'select', 'boolean'
  required: false,
  defaultValue: '',
  placeholder: 'e.g., example value',
  helpText: 'This tooltip explains what the parameter does',
  options: [ // Only for 'select' type
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ],
  rows: 2, // Only for 'textarea' type
}
```

## Parameter Fields

### Required Fields

- `id`: Unique identifier (camelCase)
- `label`: Display name
- `type`: Input type (`text`, `textarea`, `select`, `boolean`)
- `required`: Whether the parameter is mandatory
- `defaultValue`: Default value when form loads
- `helpText`: Tooltip description (shown on hover over help icon)

### Optional Fields

- `placeholder`: Input placeholder text
- `options`: Array of options for `select` type
- `rows`: Number of rows for `textarea` type

## Parameter Types

### Text Input

```typescript
{
  type: 'text',
  placeholder: 'Enter value here',
}
```

### Textarea

```typescript
{
  type: 'textarea',
  placeholder: 'Enter multiple lines',
  rows: 3,
}
```

### Select Dropdown

```typescript
{
  type: 'select',
  options: [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
  ],
}
```

## Components

### ParameterField Component

Located at `src/components/ParameterField.tsx`, this component:

- Automatically renders the correct input type
- Shows help tooltips with parameter descriptions
- Handles validation errors
- Applies proper styling and accessibility

### Usage in Forms

The inline deployment form in `PipelinesView` uses the `ParameterField` component to render parameters from the config with tooltips and validation.

## Modifying Existing Parameters

To update a parameter:

1. Find it in `src/config/deployment.config.ts`
2. Modify any field (label, helpText, defaultValue, etc.)
3. Save the file
4. Changes are automatically reflected in the UI

## Example: Current Parameters

Current deployment parameters include:

- **version**: Version number to deploy
- **scioInstance**: Specific SCIO instance
- **group**: Deployment group
- **operations**: Comma-separated list of operations
- **platform**: Target cloud platform
- **branch**: Git branch to deploy from
- **allowNewMajorVersion**: Allow major version upgrades
- **postDeployValidation**: Enable post-deployment validation
- **soakTimeMinutes**: Soak time before marking deployment successful
- **deployOrchestratorMode**: Deployment orchestrator mode
- **dagName**: Optional DAG configuration
- **extraArgs**: Additional key-value arguments
- **slackNotification**: Enable Slack notifications

## Benefits

✅ **Centralized Configuration**: All parameters in one file
✅ **Easy Maintenance**: Add/remove parameters without touching UI code
✅ **Consistent UI**: All parameters render with same styling and behavior
✅ **Built-in Help**: Every parameter has a tooltip explanation
✅ **Type Safety**: TypeScript ensures correct parameter structure
✅ **Reusable**: Same config can be used across multiple forms

## Validation

Parameters are automatically validated based on the `required` field. Custom validation logic can be added in the form component's `validateForm()` function.
