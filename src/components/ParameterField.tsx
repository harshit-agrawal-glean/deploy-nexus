import React from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { DeploymentParameter } from '../config/deployment.config';

interface ParameterFieldProps {
  parameter: DeploymentParameter;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ParameterField({ parameter, value, onChange, error }: ParameterFieldProps) {
  const { id, label, type, required, placeholder, helpText, options, rows } = parameter;

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <div className="relative">
            <Textarea
              id={id}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
              rows={rows || 3}
            />
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onChange('');
                }}
                className="absolute right-2 top-2 p-1 rounded-full hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors z-10 cursor-pointer"
                aria-label="Clear input"
                title="Clear input"
              >
                <X className="h-3 w-3" strokeWidth={2.5} />
              </button>
            )}
          </div>
        );
      
      case 'select':
        return (
          <div className="relative">
            <Select value={value || undefined} onValueChange={onChange}>
              <SelectTrigger
                id={id}
                className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
              >
                <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {options?.filter(opt => opt.value !== '').map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onChange('');
                }}
                className="absolute right-10 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors z-10 cursor-pointer"
                aria-label="Clear selection"
                title="Clear selection"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        );
      
      case 'text':
      default:
        return (
          <div className="relative">
            <Input
              id={id}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onChange('');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors z-10 cursor-pointer"
                aria-label="Clear input"
                title="Clear input"
              >
                <X className="h-3 w-3" strokeWidth={2.5} />
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full p-0.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-help"
              aria-label="Help"
            >
              <HelpCircle className="h-4 w-4" strokeWidth={2} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-sm">
            <p className="font-medium">{helpText}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      {renderInput()}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

