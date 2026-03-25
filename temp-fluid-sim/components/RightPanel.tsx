
import React, { useState } from 'react';
import Inspector from './Inspector';
import PlcPanel from './PlcPanel';
import LogicPanel from './LogicPanel'; // Import the new panel
import { cn } from '../lib/utils';
import { SlidersHorizontal, BarChart2, Network, Waypoints } from 'lucide-react';

type ActiveTab = 'properties' | 'analysis' | 'plc' | 'logic';

const RightPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('properties');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'properties':
        return <Inspector />;
      case 'analysis':
        return <div className="p-4"><p className="text-sm text-muted-foreground">Analysis tools will be available here.</p></div>;
      case 'plc':
        return <PlcPanel />;
      case 'logic':
        return <LogicPanel />; // Render the new logic panel
      default:
        return null;
    }
  };
  
  const TabButton = ({ tabId, icon, label }: { tabId: ActiveTab; icon: React.ReactNode; label: string }) => (
      <button
        onClick={() => setActiveTab(tabId)}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold border-b-2 transition-colors",
          activeTab === tabId
            ? "text-primary border-blue-500"
            : "text-muted-foreground border-transparent hover:bg-accent"
        )}
      >
        {icon}
        {label}
      </button>
  );

  return (
    <aside className="w-80 bg-card border-l-2 border-border flex flex-col">
        <div className="flex items-center border-b-2 border-border shrink-0">
            <TabButton tabId="properties" icon={<SlidersHorizontal size={16} />} label="Properties" />
            <TabButton tabId="logic" icon={<Waypoints size={16} />} label="Logic" />
            <TabButton tabId="analysis" icon={<BarChart2 size={16} />} label="Analysis" />
            <TabButton tabId="plc" icon={<Network size={16} />} label="PLC" />
        </div>
        <div className="flex-1 overflow-hidden">
            {renderTabContent()}
        </div>
    </aside>
  );
};

export default RightPanel;
