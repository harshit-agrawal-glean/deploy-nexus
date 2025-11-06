import { useState } from 'react';
import { X, Save, Eye, Edit2, Clock, User, Shield, Users, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Pipeline } from '../types';
import { toast } from 'sonner@2.0.3';
import { ACCESS_GROUPS, PIPELINE_ACCESS_MAPPINGS } from '../config/rbac.config';
import { PipelineStagesDAG } from './PipelineStagesDAG';

interface PipelineDetailSheetProps {
  pipeline: Pipeline | null;
  open: boolean;
  onClose: () => void;
  onSave: (pipeline: Pipeline) => void;
}

export function PipelineDetailSheet({
  pipeline,
  open,
  onClose,
  onSave,
}: PipelineDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showViewConfig, setShowViewConfig] = useState(false);
  const [editedPipeline, setEditedPipeline] = useState<Pipeline | null>(pipeline);

  if (!pipeline || !editedPipeline) return null;

  const handleSave = () => {
    onSave(editedPipeline);
    setIsEditing(false);
    toast.success('Pipeline configuration saved');
  };

  const handleCancel = () => {
    setEditedPipeline(pipeline);
    setIsEditing(false);
  };

  const updateConfig = (key: string, value: any) => {
    setEditedPipeline({
      ...editedPipeline,
      config: {
        ...editedPipeline.config,
        [key]: value,
      },
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const editableFields = [
    { key: 'scio_instance', label: 'SCIO Instance', type: 'text' },
    { key: 'group', label: 'Group', type: 'text' },
    { key: 'owner', label: 'Owner', type: 'text' },
    { key: 'slack_channel', label: 'Slack Channel', type: 'text' },
    { key: 'timeout_minutes', label: 'Timeout (minutes)', type: 'number' },
    { key: 'max_retries', label: 'Max Retries', type: 'number' },
  ];

  const booleanFields = [
    { key: 'auto_rollback', label: 'Auto Rollback' },
    { key: 'approval_required', label: 'Approval Required' },
  ];

  const nonEditableFields = [
    { key: 'created_date', label: 'Created Date' },
    { key: 'last_modified', label: 'Last Modified' },
    { key: 'version', label: 'Version' },
    { key: 'pipeline_id', label: 'Pipeline ID' },
  ];

  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex-1">
              <h2 className="text-slate-900">{pipeline.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={pipeline.status === 'active' ? 'default' : 'secondary'}>
                  {pipeline.status}
                </Badge>
                <span className="text-sm text-slate-600">{pipeline.description}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <Tabs defaultValue="info" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Configuration</TabsTrigger>
                <TabsTrigger value="access">Access Control</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6">
                {/* Pipeline Info */}
                <div>
                  <h3 className="text-slate-900 mb-3">Pipeline Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="h-4 w-4" />
                      Created by {pipeline.createdBy}
                    </div>
                    {pipeline.lastDeployed && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-4 w-4" />
                        Last deployed {formatDate(pipeline.lastDeployed)}
                      </div>
                    )}
                    {pipeline.config?.scio_instance && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">SCIO Instance:</span>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-900">
                          {pipeline.config.scio_instance}
                        </code>
                      </div>
                    )}
                    {pipeline.config?.group && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">Group:</span>
                        <Badge variant="secondary">{pipeline.config.group}</Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Stages:</span>
                      <span className="text-slate-900">{pipeline.stages.length} stages</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Pipeline Stages Visualization */}
                <div>
                  <h3 className="text-slate-900 mb-3">Pipeline Flow</h3>
                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                    <PipelineStagesDAG stages={pipeline.stages} />
                  </div>
                </div>

                <Separator />

                {/* Editable Configuration */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-slate-900">Configuration</h3>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {editableFields.map((field) => (
                      <div key={field.key}>
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Input
                          id={field.key}
                          type={field.type}
                          value={editedPipeline.config?.[field.key as keyof typeof editedPipeline.config] || ''}
                          onChange={(e) =>
                            updateConfig(
                              field.key,
                              field.type === 'number' ? parseInt(e.target.value) : e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                    ))}

                    {booleanFields.map((field) => (
                      <div key={field.key} className="flex items-center justify-between">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Switch
                          id={field.key}
                          checked={editedPipeline.config?.[field.key as keyof typeof editedPipeline.config] as boolean || false}
                          onCheckedChange={(checked) => updateConfig(field.key, checked)}
                          disabled={!isEditing}
                        />
                      </div>
                    ))}

                    {editedPipeline.config?.notification_emails && (
                      <div>
                        <Label>Notification Emails</Label>
                        <div className="mt-1 p-2 bg-slate-50 rounded border text-sm">
                          {editedPipeline.config.notification_emails.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* View Config Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowViewConfig(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Config
                </Button>
              </TabsContent>

              <TabsContent value="access" className="space-y-4">
                {/* Access Control Alert */}
                <Alert className="border-blue-200 bg-blue-50">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    Access control is managed via <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">/config/rbac.config.ts</code>. Changes require code review.
                  </AlertDescription>
                </Alert>

                {/* Access Control Content */}
                {(() => {
                  const accessMapping = PIPELINE_ACCESS_MAPPINGS.find((m) => m.pipelineId === pipeline.id);
                  
                  if (!accessMapping) {
                    return (
                      <div className="text-center py-8 text-slate-600">
                        <Shield className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                        <p>No access control configured for this pipeline</p>
                      </div>
                    );
                  }

                  return (
                    <>
                      {/* Group Permissions */}
                      <div>
                        <h3 className="text-slate-900 mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Group Permissions
                        </h3>
                        
                        <div className="space-y-3">
                          <div className="bg-slate-50 p-3 rounded border">
                            <p className="text-sm text-slate-700 mb-2">View Access</p>
                            <div className="flex flex-wrap gap-1">
                              {accessMapping.allowedGroups.view.map((groupId) => {
                                const group = ACCESS_GROUPS.find((g) => g.id === groupId);
                                return (
                                  <Badge key={groupId} variant="outline" className="text-xs">
                                    {group?.name || groupId}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>

                          <div className="bg-slate-50 p-3 rounded border">
                            <p className="text-sm text-slate-700 mb-2">Trigger Access</p>
                            <div className="flex flex-wrap gap-1">
                              {accessMapping.allowedGroups.trigger.map((groupId) => {
                                const group = ACCESS_GROUPS.find((g) => g.id === groupId);
                                return (
                                  <Badge key={groupId} variant="secondary" className="text-xs">
                                    {group?.name || groupId}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>

                          <div className="bg-slate-50 p-3 rounded border">
                            <p className="text-sm text-slate-700 mb-2">Edit Access</p>
                            <div className="flex flex-wrap gap-1">
                              {accessMapping.allowedGroups.edit.map((groupId) => {
                                const group = ACCESS_GROUPS.find((g) => g.id === groupId);
                                return (
                                  <Badge key={groupId} variant="default" className="text-xs">
                                    {group?.name || groupId}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>

                          <div className="bg-slate-50 p-3 rounded border">
                            <p className="text-sm text-slate-700 mb-2">Delete Access</p>
                            <div className="flex flex-wrap gap-1">
                              {accessMapping.allowedGroups.delete.map((groupId) => {
                                const group = ACCESS_GROUPS.find((g) => g.id === groupId);
                                return (
                                  <Badge key={groupId} className="text-xs bg-red-600">
                                    {group?.name || groupId}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Environment Access */}
                      <div>
                        <h3 className="text-slate-900 mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Environment Access
                        </h3>
                        
                        <div className="space-y-2">
                          {Object.entries(accessMapping.environments).map(([env, groupIds]) => (
                            <div key={env} className="bg-slate-50 p-3 rounded border">
                              <div className="flex items-center justify-between mb-2">
                                <Badge 
                                  variant="outline"
                                  className={
                                    env === 'production' 
                                      ? 'border-red-600 text-red-600' 
                                      : env === 'staging'
                                      ? 'border-amber-600 text-amber-600'
                                      : 'border-green-600 text-green-600'
                                  }
                                >
                                  {env.charAt(0).toUpperCase() + env.slice(1)}
                                </Badge>
                                <span className="text-xs text-slate-600">
                                  {groupIds.length} {groupIds.length === 1 ? 'group' : 'groups'}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {groupIds.map((groupId) => {
                                  const group = ACCESS_GROUPS.find((g) => g.id === groupId);
                                  return (
                                    <Badge key={groupId} variant="secondary" className="text-xs">
                                      {group?.name || groupId}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Google Groups */}
                      <div>
                        <h3 className="text-slate-900 mb-3">Associated Google Groups</h3>
                        <div className="space-y-2">
                          {(() => {
                            const allGroupIds = new Set([
                              ...accessMapping.allowedGroups.view,
                              ...accessMapping.allowedGroups.trigger,
                              ...accessMapping.allowedGroups.edit,
                              ...accessMapping.allowedGroups.delete,
                            ]);
                            
                            return Array.from(allGroupIds).map((groupId) => {
                              const group = ACCESS_GROUPS.find((g) => g.id === groupId);
                              if (!group) return null;
                              
                              return (
                                <div key={groupId} className="bg-slate-50 p-3 rounded border">
                                  <div className="flex items-start gap-2">
                                    <Users className="h-4 w-4 text-slate-600 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-slate-900">{group.name}</p>
                                      <code className="text-xs text-slate-600 break-all">
                                        {group.email}
                                      </code>
                                      <p className="text-xs text-slate-600 mt-1">
                                        {group.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
        />
      )}

      {/* View Config Dialog */}
      <Dialog open={showViewConfig} onOpenChange={setShowViewConfig}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Full Configuration - {pipeline.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h4 className="mb-3">Editable Configuration</h4>
              <div className="space-y-3">
                {editableFields.map((field) => (
                  <div key={field.key} className="flex justify-between text-sm">
                    <span className="text-slate-600">{field.label}:</span>
                    <span className="text-slate-900">
                      {editedPipeline.config?.[field.key as keyof typeof editedPipeline.config]?.toString() || 'N/A'}
                    </span>
                  </div>
                ))}
                {booleanFields.map((field) => (
                  <div key={field.key} className="flex justify-between text-sm">
                    <span className="text-slate-600">{field.label}:</span>
                    <Badge variant={editedPipeline.config?.[field.key as keyof typeof editedPipeline.config] ? 'default' : 'secondary'}>
                      {editedPipeline.config?.[field.key as keyof typeof editedPipeline.config] ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="mb-3">System Configuration (Read-only)</h4>
              <div className="space-y-3">
                {nonEditableFields.map((field) => (
                  <div key={field.key} className="flex justify-between text-sm">
                    <span className="text-slate-600">{field.label}:</span>
                    <span className="text-slate-900 font-mono text-xs">
                      {editedPipeline.config?.[field.key as keyof typeof editedPipeline.config]?.toString() || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowViewConfig(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setShowViewConfig(false);
                setIsEditing(true);
              }}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
