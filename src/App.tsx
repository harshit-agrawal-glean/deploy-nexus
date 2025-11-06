import { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { Sidebar } from './components/Sidebar';
import { PipelinesView } from './components/PipelinesView';
import { DeploymentsView } from './components/DeploymentsView';
import { PipelineBuilder } from './components/PipelineBuilder';
import { SettingsView } from './components/SettingsView';
import { Pipeline } from './types';

export default function App() {
  const [activeView, setActiveView] = useState('pipelines');
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | undefined>(undefined);

  const handleViewChange = (view: string) => {
    setActiveView(view);
    if (view !== 'new-pipeline') {
      setEditingPipeline(undefined);
    }
  };

  const handleEditPipeline = (pipeline: Pipeline) => {
    setEditingPipeline(pipeline);
    setActiveView('new-pipeline');
  };

  const handleSavePipeline = () => {
    setEditingPipeline(undefined);
    setActiveView('pipelines');
  };

  const renderView = () => {
    switch (activeView) {
      case 'pipelines':
        return <PipelinesView onEditPipeline={handleEditPipeline} />;
      case 'deployments':
        return <DeploymentsView />;
      case 'new-pipeline':
        return <PipelineBuilder pipeline={editingPipeline} onSave={handleSavePipeline} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <PipelinesView onEditPipeline={handleEditPipeline} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {renderView()}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
