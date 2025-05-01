
import React from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    { id: 'community', label: 'Community' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'members', label: 'Members' },
    { id: 'leaderboards', label: 'Leaderboards' },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className="pb-2 border-b">
      <h1 className="text-xl font-bold mb-4">{title}</h1>
      
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="bg-transparent p-0 h-auto space-x-6">
          {tabs.map(tab => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "pb-2 px-1 text-sm font-medium transition-colors rounded-none data-[state=active]:shadow-none",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground",
                "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ClassroomHeader;
