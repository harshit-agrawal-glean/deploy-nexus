import { useState } from 'react';
import { Plus, Trash2, GripVertical, Upload, X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { Pipeline, Stage } from '../types';
import { toast } from 'sonner@2.0.3';

interface PipelineBuilderProps {
  pipeline?: Pipeline;
  onSave: () => void;
}

interface ValidationErrors {
  name?: string;
  description?: string;
  stages?: string;
}

export function PipelineBuilder({ pipeline, onSave }: PipelineBuilderProps) {
  const [name, setName] = useState(pipeline?.name || '');
  const [description, setDescription] = useState(pipeline?.description || '');
  const [stages, setStages] = useState<Stage[]>(
    pipeline?.stages || [
      {
        id: 'stage-1',
        name: 'Build',
        type: 'build',
        config: {},
        order: 1,
        depends_on: [],
      },
    ]
  );
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!name || name.trim() === '') {
      newErrors.name = 'Pipeline name is required';
    }

    if (!description || description.trim() === '') {
      newErrors.description = 'Description is required';
    }

    if (stages.length === 0) {
      newErrors.stages = 'At least one stage is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfigUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        
        // Parse Spinnaker-like config
        if (config.stages && Array.isArray(config.stages)) {
          const parsedStages: Stage[] = config.stages.map((stage: any, index: number) => ({
            id: stage.refId || `stage-${Date.now()}-${index}`,
            name: stage.name || `Stage ${index + 1}`,
            type: stage.type || 'deploy',
            config: stage,
            order: index + 1,
            depends_on: stage.requisiteStageRefIds || [],
          }));
          
          setStages(parsedStages);
          
          // Auto-populate name if available
          if (config.name) {
            setName(config.name);
          }
          
          // Auto-populate description if available
          if (config.description) {
            setDescription(config.description);
          }
          
          toast.success('Config file loaded successfully', {
            description: `Loaded ${parsedStages.length} stages from config`,
          });
        } else {
          toast.error('Invalid config format', {
            description: 'Config file must contain a "stages" array',
          });
        }
      } catch (error) {
        toast.error('Failed to parse config file', {
          description: 'Please ensure the file is valid JSON',
        });
      }
    };
    
    reader.readAsText(file);
    // Reset the input so the same file can be uploaded again
    event.target.value = '';
  };

  const addStage = () => {
    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      name: 'New Stage',
      type: 'build',
      config: {},
      order: stages.length + 1,
      depends_on: [],
    };
    setStages([...stages, newStage]);
    if (errors.stages) {
      setErrors({ ...errors, stages: undefined });
    }
  };

  const removeStage = (id: string) => {
    // Remove the stage and clean up any dependencies on it
    setStages(
      stages
        .filter((s) => s.id !== id)
        .map((s) => ({
          ...s,
          depends_on: s.depends_on?.filter((depId) => depId !== id) || [],
        }))
    );
  };

  const updateStage = (id: string, updates: Partial<Stage>) => {
    setStages(stages.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (errors.name) {
      setErrors({ ...errors, name: undefined });
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (errors.description) {
      setErrors({ ...errors, description: undefined });
    }
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success(
      pipeline ? 'Pipeline updated successfully' : 'Pipeline created successfully'
    );
    onSave();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-slate-900">
          {pipeline ? 'Edit Pipeline' : 'Create New Pipeline'}
        </h2>
        <p className="text-slate-600 mt-1">
          Upload a pipeline config file or manually configure stages
        </p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Basic Information</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Pipeline Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Frontend Web App"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`mt-1.5 ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what this pipeline deploys..."
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className={`mt-1.5 ${errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Import Pipeline Config</h3>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
              <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <Label htmlFor="config-upload" className="cursor-pointer">
                <span className="text-sm font-medium text-slate-700">
                  Upload Pipeline Config File
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Supports JSON format (Spinnaker-compatible)
                </p>
              </Label>
              <Input
                id="config-upload"
                type="file"
                accept=".json"
                onChange={handleConfigUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => document.getElementById('config-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Upload a JSON config file to automatically populate pipeline name, description, and stages. 
              The config will be parsed and converted into stages below.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900">Pipeline Stages</h3>
            <Button onClick={addStage} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Stage
            </Button>
          </div>

          <div className="space-y-3">
            {stages.map((stage, index) => (
              <Card key={stage.id} className="p-4">
                <div className="flex items-start gap-3">
                  <GripVertical className="h-5 w-5 text-slate-400 mt-2 cursor-move" />
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Label className="text-xs">Stage Name</Label>
                        <Input
                          value={stage.name}
                          onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div className="w-40">
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={stage.type}
                          onValueChange={(value: any) =>
                            updateStage(stage.id, { type: value })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="build">Build</SelectItem>
                            <SelectItem value="test">Test</SelectItem>
                            <SelectItem value="deploy">Deploy</SelectItem>
                            <SelectItem value="approval">Approval</SelectItem>
                            <SelectItem value="notification">Notification</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Dependencies Selector - Multi Select */}
                    <div>
                      <Label className="text-xs">Depends On (Optional)</Label>
                      
                      {/* Display selected dependencies as badges */}
                      {stage.depends_on && stage.depends_on.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 mb-2">
                          {stage.depends_on.map((depId) => {
                            const depStage = stages.find((s) => s.id === depId);
                            return depStage ? (
                              <Badge
                                key={depId}
                                variant="secondary"
                                className="flex items-center gap-1 pr-1"
                              >
                                {depStage.name}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newDeps = stage.depends_on?.filter((id) => id !== depId) || [];
                                    updateStage(stage.id, { depends_on: newDeps });
                                  }}
                                  className="ml-1 hover:bg-slate-300 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      )}
                      
                      {/* Dropdown to add new dependencies */}
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (value && value !== 'none') {
                            const currentDeps = stage.depends_on || [];
                            if (!currentDeps.includes(value)) {
                              updateStage(stage.id, { depends_on: [...currentDeps, value] });
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Add dependency..." />
                        </SelectTrigger>
                        <SelectContent>
                          {stages
                            .filter((s) => s.id !== stage.id && !(stage.depends_on || []).includes(s.id))
                            .map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          {stages.filter((s) => s.id !== stage.id && !(stage.depends_on || []).includes(s.id)).length === 0 && (
                            <SelectItem value="none" disabled>
                              No more stages available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500 mt-1">
                        Select multiple stages that must complete before this one starts
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStage(stage.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          {errors.stages && (
            <p className="text-sm text-red-600 mt-3">{errors.stages}</p>
          )}
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onSave}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {pipeline ? 'Update Pipeline' : 'Create Pipeline'}
          </Button>
        </div>
      </div>
    </div>
  );
}
