
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LessonAttachments from '@/components/course/LessonAttachments';
import { QuickTip } from '@/components/admin/dashboard';

interface Attachment {
  id: string;
  name: string;
  file_url: string;
  type: string;
}

interface LessonTabsProps {
  description: string | null;
  attachments: Attachment[];
}

const LessonTabs: React.FC<LessonTabsProps> = ({
  description,
  attachments
}) => {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="resources" className="relative">
          Resources
          {attachments.length > 0 && (
            <span className="absolute top-0 right-1 transform translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {attachments.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="pt-4">
        <div className="prose prose-invert max-w-none">
          {description ? (
            <div>
              <h2>Description</h2>
              <p>{description}</p>
              
              <QuickTip
                title="Resource Available"
                description="Check out the additional documentation for this lesson."
                resourceUrl="#resources"
                resourceLabel="View Documentation"
              />
            </div>
          ) : (
            <p className="text-muted-foreground">No additional details available for this lesson.</p>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="resources" className="pt-4">
        <LessonAttachments attachments={attachments} />
      </TabsContent>
      
      <TabsContent value="comments" className="pt-4">
        <div className="bg-muted/30 rounded-md p-6 text-center">
          <p className="text-muted-foreground">Comments feature coming soon.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default LessonTabs;
