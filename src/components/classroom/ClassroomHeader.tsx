
import React from 'react';
import { cn } from '@/lib/utils';

interface ClassroomHeaderProps {
  title: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ClassroomHeader: React.FC<ClassroomHeaderProps> = ({ 
  title, 
  activeTab, 
  onTabChange 
}) => {
  const tabs = [
    { id: 'classroom', label: 'Classroom' },
  ];

  return (
    <div className="border-b mb-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      
      <div className="flex space-x-8 -mb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "py-3 px-1 border-b-2 font-medium transition-colors",
              activeTab === tab.id 
                ? "border-primary text-foreground" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClassroomHeader;
