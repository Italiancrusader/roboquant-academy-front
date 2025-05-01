
import React from 'react';
import { Link } from 'react-router-dom';
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
    { id: 'community', label: 'Community' },
    { id: 'classroom', label: 'Classroom' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'members', label: 'Members' },
    { id: 'leaderboards', label: 'Leaderboards' },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className="pb-2 border-b">
      <h1 className="text-xl font-bold mb-4">{title}</h1>
      
      <div className="flex space-x-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "pb-2 px-1 text-sm font-medium transition-colors",
              activeTab === tab.id ? 
                "border-b-2 border-primary text-foreground" : 
                "text-muted-foreground hover:text-foreground"
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
