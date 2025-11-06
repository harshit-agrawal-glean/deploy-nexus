import { Rocket, Activity, Plus, Settings } from 'lucide-react';
import { Button } from './ui/button';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'pipelines', label: 'Pipelines', icon: Rocket },
    { id: 'deployments', label: 'Deployments', icon: Activity },
    { id: 'new-pipeline', label: 'New Pipeline', icon: Plus },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 border-r bg-slate-50 p-4 flex flex-col h-screen">
      <div className="mb-8">
        <h1 className="text-slate-900 flex items-center gap-2">
          <Rocket className="h-6 w-6 text-blue-600" />
          Deploy Nexus
        </h1>
        <p className="text-slate-600 text-sm mt-1">Deployment Management</p>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="pt-4 border-t">
        <div className="flex items-center gap-3 p-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
            AC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-900 truncate">Alice Chen</p>
            <p className="text-xs text-slate-600">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
