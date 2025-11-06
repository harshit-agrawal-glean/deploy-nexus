import { ArrowRight } from 'lucide-react';
import { Stage } from '../types';
import { useMemo } from 'react';

interface PipelineStagesDAGProps {
  stages: Stage[];
  compact?: boolean;
}

interface StagePosition {
  stage: Stage;
  level: number;
  column: number;
}

const getStageColor = (type: string) => {
  switch (type) {
    case 'build':
      return '#3b82f6'; // blue
    case 'test':
      return '#a855f7'; // purple
    case 'deploy':
      return '#22c55e'; // green
    case 'approval':
      return '#f97316'; // orange
    case 'notification':
      return '#64748b'; // slate
    default:
      return '#64748b';
  }
};

// Calculate DAG layout with levels
const calculateDAGLayout = (stages: Stage[]): StagePosition[] => {
  const stageMap = new Map(stages.map((s) => [s.id, s]));
  const levels = new Map<string, number>();
  const visited = new Set<string>();

  // Calculate level for each stage using DFS
  const calculateLevel = (stageId: string): number => {
    if (levels.has(stageId)) {
      return levels.get(stageId)!;
    }

    const stage = stageMap.get(stageId);
    if (!stage) return 0;

    // If no dependencies, it's at level 0
    if (!stage.depends_on || stage.depends_on.length === 0) {
      levels.set(stageId, 0);
      return 0;
    }

    // Calculate max level of dependencies and add 1
    const maxDependencyLevel = Math.max(
      ...stage.depends_on.map((depId) => calculateLevel(depId))
    );
    const level = maxDependencyLevel + 1;
    levels.set(stageId, level);
    return level;
  };

  // Calculate levels for all stages
  stages.forEach((stage) => calculateLevel(stage.id));

  // Group stages by level
  const levelGroups = new Map<number, Stage[]>();
  stages.forEach((stage) => {
    const level = levels.get(stage.id) || 0;
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level)!.push(stage);
  });

  // Assign positions
  const positions: StagePosition[] = [];
  levelGroups.forEach((stagesInLevel, level) => {
    stagesInLevel.forEach((stage, column) => {
      positions.push({ stage, level, column });
    });
  });

  return positions;
};

export function PipelineStagesDAG({ stages, compact = false }: PipelineStagesDAGProps) {
  const positions = useMemo(() => calculateDAGLayout(stages), [stages]);

  if (compact) {
    // Compact view: simple horizontal flow with circles
    const sortedStages = [...stages].sort((a, b) => a.order - b.order);
    return (
      <div className="flex items-center gap-4 overflow-x-auto py-4">
        {sortedStages.map((stage, index) => (
          <div key={stage.id} className="flex items-center gap-4 flex-shrink-0">
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-sm"
                style={{
                  borderColor: getStageColor(stage.type),
                  backgroundColor: `${getStageColor(stage.type)}20`,
                }}
              />
              <span className="text-xs text-slate-700 font-medium text-center max-w-[80px]">
                {stage.name}
              </span>
            </div>
            {index < sortedStages.length - 1 && (
              <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0 -mx-1" />
            )}
          </div>
        ))}
      </div>
    );
  }

  // Calculate dimensions
  const maxLevel = Math.max(...positions.map((p) => p.level), 0);
  const columnsPerLevel = new Map<number, number>();
  positions.forEach((pos) => {
    const current = columnsPerLevel.get(pos.level) || 0;
    columnsPerLevel.set(pos.level, Math.max(current, pos.column + 1));
  });

  const nodeRadius = 28;
  const horizontalGap = 180;
  const verticalGap = 100;
  const labelHeight = 40;

  return (
    <div className="relative overflow-x-auto pb-4">
      <svg
        width={Math.max(800, (maxLevel + 1) * horizontalGap + 200)}
        height={(Math.max(...columnsPerLevel.values(), 1)) * verticalGap + labelHeight + 40}
        className="mx-auto"
      >
        {/* Draw connections */}
        {positions.map((pos) => {
          const stage = pos.stage;
          if (!stage.depends_on || stage.depends_on.length === 0) return null;

          return stage.depends_on.map((depId) => {
            const depPos = positions.find((p) => p.stage.id === depId);
            if (!depPos) return null;

            const x1 = depPos.level * horizontalGap + 100 + nodeRadius;
            const y1 = depPos.column * verticalGap + 50 + nodeRadius;
            const x2 = pos.level * horizontalGap + 100 - nodeRadius;
            const y2 = pos.column * verticalGap + 50 + nodeRadius;

            return (
              <g key={`${depId}-${stage.id}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          });
        })}

        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Draw stages as circles */}
        {positions.map((pos) => {
          const cx = pos.level * horizontalGap + 100;
          const cy = pos.column * verticalGap + 50 + nodeRadius;
          const color = getStageColor(pos.stage.type);

          return (
            <g key={pos.stage.id}>
              {/* Node circle */}
              <circle
                cx={cx}
                cy={cy}
                r={nodeRadius}
                fill={`${color}20`}
                stroke={color}
                strokeWidth="3"
                className="transition-all hover:opacity-80 cursor-pointer"
              />
              
              {/* Stage name below the node */}
              <text
                x={cx}
                y={cy + nodeRadius + 20}
                textAnchor="middle"
                className="text-sm font-semibold fill-slate-700"
              >
                {pos.stage.name}
              </text>
              
              {/* Stage type below name */}
              <text
                x={cx}
                y={cy + nodeRadius + 35}
                textAnchor="middle"
                className="text-xs fill-slate-500 capitalize"
              >
                {pos.stage.type}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Background grid */}
      <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle, #e2e8f0 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
      </div>
    </div>
  );
}

