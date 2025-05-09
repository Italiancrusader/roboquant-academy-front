
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabViewProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'pill';
}

const TabView: React.FC<TabViewProps> = ({
  tabs,
  defaultTab,
  className,
  variant = 'default',
}) => {
  const initialTab = defaultTab || (tabs.length > 0 ? tabs[0].id : '');

  return (
    <Tabs defaultValue={initialTab} className={cn("w-full", className)}>
      <TabsList className={cn(
        "w-full flex overflow-x-auto mb-4 justify-start",
        variant === 'compact' && "p-0.5 h-8",
        variant === 'pill' && "bg-transparent p-0 h-auto space-x-2 justify-start"
      )}>
        {tabs.map(tab => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id}
            className={cn(
              "flex items-center gap-1.5",
              variant === 'compact' && "text-xs py-0.5 px-2",
              variant === 'pill' && "bg-muted/50 hover:bg-muted rounded-full px-4"
            )}
          >
            {tab.icon && <span className="opacity-80">{tab.icon}</span>}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map(tab => (
        <TabsContent key={tab.id} value={tab.id} className="mt-0">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default TabView;
