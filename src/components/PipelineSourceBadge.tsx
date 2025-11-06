import React from 'react';
import { Badge } from './ui/badge';
import { Pipeline } from '../types';

interface PipelineSourceBadgeProps {
  pipeline: Pipeline;
}

export function PipelineSourceBadge({ pipeline }: PipelineSourceBadgeProps) {
  const source = pipeline.config?.source;

  if (!source || source === 'manual') {
    return null;
  }

  const getBadgeConfig = () => {
    switch (source) {
      case 'github-actions':
        return {
          label: 'GitHub Actions',
          className: 'bg-purple-600 text-white hover:bg-purple-700 border-2 border-purple-500 font-bold shadow-md',
          icon: (
            <svg className="w-3 h-3 mr-1" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          ),
        };
      case 'spinnaker':
        return {
          label: 'Spinnaker',
          className: 'bg-blue-600 text-white hover:bg-blue-700 border-2 border-blue-500 font-semibold shadow-sm',
          icon: (
            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
            </svg>
          ),
        };
      default:
        return null;
    }
  };

  const config = getBadgeConfig();
  if (!config) return null;

  // Use inline styles for guaranteed visibility
  const inlineStyle = source === 'github-actions' 
    ? { backgroundColor: '#7c3aed', color: '#ffffff', borderColor: '#6d28d9' }
    : { backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#1d4ed8' };

  return (
    <Badge 
      variant="outline" 
      className="flex items-center text-xs font-bold border-2 shadow-md"
      style={inlineStyle}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}

