import { useState } from 'react';
import { CheckCircle2, XCircle, Loader2, Clock, MinusCircle, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Deployment } from '../types';
import { mockDeployments } from '../data/mockData';

export function DeploymentsView() {
  const [deployments] = useState<Deployment[]>(mockDeployments);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPipeline, setFilterPipeline] = useState<string>('all');

  const getStatusIcon = (status: Deployment['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'cancelled':
        return <MinusCircle className="h-4 w-4 text-slate-600" />;
    }
  };

  const getRowBackgroundStyle = (status: Deployment['status']) => {
    switch (status) {
      case 'success':
        return { backgroundColor: '#f0fdf4' }; // green-50
      case 'failed':
        return { backgroundColor: '#fef2f2' }; // red-50
      case 'running':
        return { backgroundColor: '#eff6ff' }; // blue-50
      case 'pending':
        return { backgroundColor: '#fffbeb' }; // amber-50
      case 'cancelled':
        return { backgroundColor: '#f8fafc' }; // slate-50
      default:
        return {};
    }
  };

  const getStatusStyle = (status: Deployment['status']) => {
    switch (status) {
      case 'success':
        return {
          backgroundColor: '#16a34a', // green-600
          color: 'white',
          fontWeight: '600'
        };
      case 'failed':
        return {
          backgroundColor: '#dc2626', // red-600
          color: 'white',
          fontWeight: '600'
        };
      case 'running':
        return {
          backgroundColor: '#2563eb', // blue-600
          color: 'white',
          fontWeight: '600'
        };
      case 'pending':
        return {
          backgroundColor: '#d97706', // amber-600
          color: 'white',
          fontWeight: '600'
        };
      case 'cancelled':
        return {
          backgroundColor: '#475569', // slate-600
          color: 'white',
          fontWeight: '600'
        };
      default:
        return {
          backgroundColor: '#e2e8f0',
          color: '#334155'
        };
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const filteredDeployments = deployments.filter((deployment) => {
    if (filterStatus !== 'all' && deployment.status !== filterStatus) return false;
    if (filterPipeline !== 'all' && deployment.pipelineId !== filterPipeline) return false;
    return true;
  });

  const uniquePipelines = Array.from(new Set(deployments.map((d) => d.pipelineId)));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-slate-900">Deployment History</h2>
        <p className="text-slate-600 mt-1">Track and monitor all deployment executions</p>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-2">
                  <span>Status</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 hover:bg-slate-100"
                      >
                        <Filter className={`h-3.5 w-3.5 ${filterStatus !== 'all' ? 'text-blue-600' : 'text-slate-400'}`} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" align="start">
                      <div className="space-y-1">
                        <div 
                          className={`px-3 py-2 text-sm rounded cursor-pointer hover:bg-slate-100 ${filterStatus === 'all' ? 'bg-slate-100 font-medium' : ''}`}
                          onClick={() => setFilterStatus('all')}
                        >
                          All Statuses
                        </div>
                        <div 
                          className={`px-3 py-2 text-sm rounded cursor-pointer hover:bg-slate-100 ${filterStatus === 'success' ? 'bg-slate-100 font-medium' : ''}`}
                          onClick={() => setFilterStatus('success')}
                        >
                          Success
                        </div>
                        <div 
                          className={`px-3 py-2 text-sm rounded cursor-pointer hover:bg-slate-100 ${filterStatus === 'failed' ? 'bg-slate-100 font-medium' : ''}`}
                          onClick={() => setFilterStatus('failed')}
                        >
                          Failed
                        </div>
                        <div 
                          className={`px-3 py-2 text-sm rounded cursor-pointer hover:bg-slate-100 ${filterStatus === 'running' ? 'bg-slate-100 font-medium' : ''}`}
                          onClick={() => setFilterStatus('running')}
                        >
                          Running
                        </div>
                        <div 
                          className={`px-3 py-2 text-sm rounded cursor-pointer hover:bg-slate-100 ${filterStatus === 'pending' ? 'bg-slate-100 font-medium' : ''}`}
                          onClick={() => setFilterStatus('pending')}
                        >
                          Pending
                        </div>
                        <div 
                          className={`px-3 py-2 text-sm rounded cursor-pointer hover:bg-slate-100 ${filterStatus === 'cancelled' ? 'bg-slate-100 font-medium' : ''}`}
                          onClick={() => setFilterStatus('cancelled')}
                        >
                          Cancelled
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <span>Pipeline</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 hover:bg-slate-100"
                      >
                        <Filter className={`h-3.5 w-3.5 ${filterPipeline !== 'all' ? 'text-blue-600' : 'text-slate-400'}`} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2" align="start">
                      <div className="space-y-1">
                        <div 
                          className={`px-3 py-2 text-sm rounded cursor-pointer hover:bg-slate-100 ${filterPipeline === 'all' ? 'bg-slate-100 font-medium' : ''}`}
                          onClick={() => setFilterPipeline('all')}
                        >
                          All Pipelines
                        </div>
                        {uniquePipelines.map((pipelineId) => {
                          const deployment = deployments.find((d) => d.pipelineId === pipelineId);
                          return (
                            <div 
                              key={pipelineId}
                              className={`px-3 py-2 text-sm rounded cursor-pointer hover:bg-slate-100 ${filterPipeline === pipelineId ? 'bg-slate-100 font-medium' : ''}`}
                              onClick={() => setFilterPipeline(pipelineId)}
                            >
                              {deployment?.pipelineName}
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Triggered By</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeployments.map((deployment) => (
              <TableRow 
                key={deployment.id}
                style={getRowBackgroundStyle(deployment.status)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(deployment.status)}
                    <span 
                      style={getStatusStyle(deployment.status)}
                      className="inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs uppercase"
                    >
                      {deployment.status}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-slate-900">{deployment.pipelineName}</p>
                    <p className="text-sm text-slate-600">{deployment.id}</p>
                  </div>
                </TableCell>
                <TableCell>{deployment.version}</TableCell>
                <TableCell className="text-slate-600">{deployment.triggeredBy}</TableCell>
                <TableCell className="text-slate-600">
                  {formatDateTime(deployment.triggeredAt)}
                </TableCell>
                <TableCell className="text-slate-600">
                  {formatDuration(deployment.duration)}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    View Logs
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
