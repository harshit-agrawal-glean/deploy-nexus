import React, { useState, useMemo, useEffect } from 'react';
import { Play, MoreVertical, Pin, Search, ChevronDown, ChevronUp, ChevronsDownUp, ChevronsUpDown, Clock, Plus, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Pipeline } from '../types';
import { mockPipelines } from '../data/mockData';
import { PipelineDetailSheet } from './PipelineDetailSheet';
import { toast } from 'sonner';
import { PipelineStagesDAG } from './PipelineStagesDAG';
import { TooltipProvider } from './ui/tooltip';
import { deploymentParameters } from '../config/deployment.config';
import { ParameterField } from './ParameterField';
import { PipelineSourceBadge } from './PipelineSourceBadge';
import { loadAllPipelines } from '../services/pipelineLoader';

interface PipelinesViewProps {
  onEditPipeline: (pipeline: Pipeline) => void;
}

const ITEMS_PER_PAGE = 10;

export function PipelinesView({ onEditPipeline }: PipelinesViewProps) {
  const [pipelines, setPipelines] = useState<Pipeline[]>(mockPipelines);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  
  // Deployment form state for each pipeline - dynamic to support any parameters
  const [deploymentForms, setDeploymentForms] = useState<Record<string, Record<string, any>>>({});

  // Validation errors for each pipeline form
  const [formErrors, setFormErrors] = useState<Record<string, Record<string, string>>>({});

  // Load pipelines from GitHub Actions and Spinnaker on mount
  useEffect(() => {
    const loadPipelines = async () => {
      setLoading(true);
      try {
        const loadedPipelines = await loadAllPipelines();
        console.log('Loaded pipelines from sources:', loadedPipelines);
        
        // Merge with existing mock pipelines
        setPipelines([...mockPipelines, ...loadedPipelines]);
        
        if (loadedPipelines.length > 0) {
          toast.success(`Loaded ${loadedPipelines.length} pipeline(s) from GitHub Actions and Spinnaker`, {
            description: 'Pipelines are now available for deployment',
          });
        }
      } catch (error) {
        console.error('Failed to load pipelines:', error);
        toast.error('Failed to load pipelines from sources', {
          description: String(error),
        });
      } finally {
        setLoading(false);
      }
    };

    loadPipelines();
  }, []);

  const togglePin = (pipelineId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const pipeline = pipelines.find((p) => p.id === pipelineId);
    setPipelines(
      pipelines.map((p) =>
        p.id === pipelineId ? { ...p, pinned: !p.pinned } : p
      )
    );
    if (pipeline) {
      toast.success(
        pipeline.pinned ? 'Pipeline unpinned' : 'Pipeline pinned to top'
      );
    }
  };

  const toggleRow = (pipelineId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pipelineId)) {
        newSet.delete(pipelineId);
      } else {
        newSet.add(pipelineId);
        // Initialize form state if not exists
        if (!deploymentForms[pipelineId]) {
          const pipeline = pipelines.find(p => p.id === pipelineId);
          const initialFormData: Record<string, any> = {};
          
          // If pipeline has extracted parameters, use their default values
          if (pipeline?.config?.parameters && pipeline.config.parameters.length > 0) {
            pipeline.config.parameters.forEach(param => {
              initialFormData[param.id] = param.defaultValue || '';
            });
          } else {
            // Fallback to generic form fields
            initialFormData.version = '';
            initialFormData.branch = 'master';
            initialFormData.scioInstance = '';
            initialFormData.group = '';
            initialFormData.operations = '';
            initialFormData.extraArgs = '';
          }
          
          setDeploymentForms((forms) => ({
            ...forms,
            [pipelineId]: initialFormData,
          }));
        }
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = new Set(currentPipelines.map((p) => p.id));
    setExpandedRows(allIds);
    // Initialize all forms
    const newForms = { ...deploymentForms };
    currentPipelines.forEach((pipeline) => {
      if (!newForms[pipeline.id]) {
        const initialFormData: Record<string, any> = {};
        
        // If pipeline has extracted parameters, use their default values
        if (pipeline.config?.parameters && pipeline.config.parameters.length > 0) {
          pipeline.config.parameters.forEach(param => {
            initialFormData[param.id] = param.defaultValue || '';
          });
        } else {
          // Fallback to generic form fields
          initialFormData.version = '';
          initialFormData.branch = 'master';
          initialFormData.scioInstance = '';
          initialFormData.group = '';
          initialFormData.operations = '';
          initialFormData.extraArgs = '';
        }
        
        newForms[pipeline.id] = initialFormData;
      }
    });
    setDeploymentForms(newForms);
  };

  const collapseAll = () => {
    setExpandedRows(new Set());
  };

  const updateDeploymentForm = (pipelineId: string, field: string, value: string) => {
    setDeploymentForms((forms) => ({
      ...forms,
      [pipelineId]: {
        ...forms[pipelineId],
        [field]: value,
      },
    }));

    // Clear error for this field when user starts typing
    if (formErrors[pipelineId]?.[field as 'version' | 'scioInstance' | 'group']) {
      setFormErrors((errors) => ({
        ...errors,
        [pipelineId]: {
          ...errors[pipelineId],
          [field]: undefined,
        },
      }));
    }
  };

  const validateDeploymentForm = (pipelineId: string): boolean => {
    const form = deploymentForms[pipelineId];
    const errors: { version?: string; scioInstance?: string; group?: string } = {};

    if (!form || !form.version) {
      errors.version = 'Version is required';
    } else if (!/^\d+\.\d+\.\d+$/.test(form.version)) {
      errors.version = 'Version must be in format X.Y.Z (e.g., 2.4.1)';
    }

    // scioInstance and group are optional, no validation needed

    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [pipelineId]: errors,
    }));

    return Object.keys(errors).length === 0;
  };

  const handleTriggerDeployment = (pipeline: Pipeline, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!validateDeploymentForm(pipeline.id)) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    const form = deploymentForms[pipeline.id];

    toast.success('Deployment triggered successfully', {
      description: `${pipeline.name} v${form.version} is being deployed`,
    });
    
    // Reset form and errors
    setDeploymentForms((forms) => ({
      ...forms,
      [pipeline.id]: {
        version: '',
        branch: 'master',
        scioInstance: '',
        group: '',
        operations: '',
        extraArgs: '',
      },
    }));
    
    setFormErrors((errors) => ({
      ...errors,
      [pipeline.id]: {},
    }));
    
    // Collapse row
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(pipeline.id);
      return newSet;
    });
  };

  const handleViewDetails = (pipeline: Pipeline, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPipeline(pipeline);
    setShowDetailSheet(true);
  };

  const handleSavePipeline = (updatedPipeline: Pipeline) => {
    setPipelines(
      pipelines.map((p) => (p.id === updatedPipeline.id ? updatedPipeline : p))
    );
    setSelectedPipeline(updatedPipeline);
  };

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  // Filter and sort pipelines
  const filteredAndSortedPipelines = useMemo(() => {
    let filtered = pipelines;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (pipeline) =>
          pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pipeline.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort: pinned first, then by last deployed
    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // If both pinned or both not pinned, sort by last deployed
      if (a.lastDeployed && b.lastDeployed) {
        return b.lastDeployed.getTime() - a.lastDeployed.getTime();
      }
      if (a.lastDeployed) return -1;
      if (b.lastDeployed) return 1;
      return 0;
    });
  }, [pipelines, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPipelines.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPipelines = filteredAndSortedPipelines.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-slate-900">Deployment Pipelines</h2>
          <p className="text-slate-600 mt-1">Manage and execute your deployment pipelines</p>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading pipelines...
            </div>
          )}
          <Button onClick={() => onEditPipeline(undefined as any)}>
            <Plus className="h-4 w-4 mr-2" />
            New Pipeline
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search pipelines by name or description..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results count and expand/collapse controls */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Showing {currentPipelines.length} of {filteredAndSortedPipelines.length} pipeline
          {filteredAndSortedPipelines.length !== 1 ? 's' : ''}
          {searchQuery && (
            <span>
              {' '}
              matching "{searchQuery}"
            </span>
          )}
        </div>
        
        {currentPipelines.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
            >
              <ChevronsDownUp className="h-4 w-4 mr-2" />
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
            >
              <ChevronsUpDown className="h-4 w-4 mr-2" />
              Collapse All
            </Button>
          </div>
        )}
      </div>

      {/* Pipeline Table */}
      <div className="border rounded-lg mb-6 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Pipeline Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPipelines.map((pipeline) => {
              const isExpanded = expandedRows.has(pipeline.id);
              const form = deploymentForms[pipeline.id] || { 
                version: '', 
                branch: 'master',
                scioInstance: '',
                group: '',
                operations: '',
                extraArgs: '',
              };
              const errors = formErrors[pipeline.id] || {};
              
              return (
                <React.Fragment key={pipeline.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => toggleRow(pipeline.id)}
                  >
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => togglePin(pipeline.id, e)}
                      >
                        <Pin
                          className={`h-4 w-4 ${
                            pipeline.pinned
                              ? 'text-blue-600 fill-blue-600'
                              : 'text-slate-400'
                          }`}
                        />
                      </Button>
                    </TableCell>
                    <TableCell>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-600" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-600" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900">{pipeline.name}</span>
                          <PipelineSourceBadge pipeline={pipeline} />
                        </div>
                        <div className="text-sm text-slate-600">{pipeline.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={pipeline.status === 'active' ? 'default' : 'secondary'}>
                        {pipeline.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {pipeline.lastDeployed ? (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="h-4 w-4" />
                          {formatDate(pipeline.lastDeployed)}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">{pipeline.createdBy}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem
                              onClick={(e) => handleViewDetails(pipeline, e)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditPipeline(pipeline);
                              }}
                            >
                              Edit Pipeline
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => e.stopPropagation()}
                            >
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => e.stopPropagation()}
                            >
                              View History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Collapsible Row Content */}
                  {isExpanded && (
                    <TableRow key={`${pipeline.id}-expanded`}>
                      <TableCell colSpan={7} className="bg-slate-50 p-6">
                        <div className="max-w-4xl">
                          <h3 className="mb-4 text-slate-900">Trigger Deployment</h3>
                          
                          {/* Show pipeline source info if available */}
                          {pipeline.config?.source && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-900">
                                <strong>Source:</strong> {pipeline.config.source === 'github-actions' ? 'GitHub Actions' : 'Spinnaker'}
                                {pipeline.config.sourcePath && (
                                  <span className="ml-2 text-blue-700">
                                    ({pipeline.config.sourcePath.split('/').pop()})
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                          
                          <TooltipProvider>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                              {/* Use extracted parameters if available, otherwise use default parameters */}
                              {pipeline.config?.parameters && pipeline.config.parameters.length > 0 ? (
                                // Render dynamically extracted parameters from the pipeline
                                pipeline.config.parameters.map((param) => (
                                  <div 
                                    key={param.id}
                                    className={param.type === 'textarea' ? 'md:col-span-2 lg:col-span-3' : ''}
                                  >
                                    <ParameterField
                                      parameter={param}
                                      value={form[param.id as keyof typeof form] ?? param.defaultValue ?? ''}
                                      onChange={(value) => updateDeploymentForm(pipeline.id, param.id, value)}
                                      error={errors[param.id as keyof typeof errors]}
                                    />
                                  </div>
                                ))
                              ) : (
                                // Fallback to default generic parameters
                                <>
                                  <ParameterField
                                    parameter={deploymentParameters.find(p => p.id === 'version')!}
                                    value={form.version}
                                    onChange={(value) => updateDeploymentForm(pipeline.id, 'version', value)}
                                    error={errors.version}
                                  />

                                  <ParameterField
                                    parameter={deploymentParameters.find(p => p.id === 'branch')!}
                                    value={form.branch}
                                    onChange={(value) => updateDeploymentForm(pipeline.id, 'branch', value)}
                                  />

                                  <ParameterField
                                    parameter={deploymentParameters.find(p => p.id === 'scioInstance')!}
                                    value={form.scioInstance}
                                    onChange={(value) => updateDeploymentForm(pipeline.id, 'scioInstance', value)}
                                  />

                                  <ParameterField
                                    parameter={deploymentParameters.find(p => p.id === 'group')!}
                                    value={form.group}
                                    onChange={(value) => updateDeploymentForm(pipeline.id, 'group', value)}
                                  />

                                  <div className="md:col-span-2 lg:col-span-3">
                                    <ParameterField
                                      parameter={deploymentParameters.find(p => p.id === 'operations')!}
                                      value={form.operations}
                                      onChange={(value) => updateDeploymentForm(pipeline.id, 'operations', value)}
                                    />
                                  </div>

                                  <div className="md:col-span-2 lg:col-span-3">
                                    <ParameterField
                                      parameter={deploymentParameters.find(p => p.id === 'extraArgs')!}
                                      value={form.extraArgs}
                                      onChange={(value) => updateDeploymentForm(pipeline.id, 'extraArgs', value)}
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </TooltipProvider>

                          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 mb-6">
                            <p className="text-sm text-slate-700 font-semibold mb-4">
                              Pipeline Stages:
                            </p>
                            <PipelineStagesDAG stages={pipeline.stages} />
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              onClick={(e) => toggleRow(pipeline.id, e)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={(e) => handleTriggerDeployment(pipeline, e)}
                              disabled={pipeline.status !== 'active'}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Trigger Deployment
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Empty State */}
      {currentPipelines.length === 0 && (
        <div className="text-center py-12 border rounded-lg bg-white">
          <p className="text-slate-600">
            {searchQuery
              ? `No pipelines found matching "${searchQuery}"`
              : 'No pipelines found'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                  className={
                    currentPage === 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                  }}
                  className={
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Detail Sheet (for extra details) */}
      {selectedPipeline && (
        <PipelineDetailSheet
          pipeline={selectedPipeline}
          open={showDetailSheet}
          onClose={() => setShowDetailSheet(false)}
          onSave={handleSavePipeline}
        />
      )}
    </div>
  );
}
