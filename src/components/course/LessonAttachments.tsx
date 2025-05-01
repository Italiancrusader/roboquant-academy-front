
import React from 'react';
import { FileText } from 'lucide-react';

interface Attachment {
  id: string;
  name: string;
  file_url: string;
  type: string;
}

interface LessonAttachmentsProps {
  attachments: Attachment[];
}

const LessonAttachments = ({ attachments }: LessonAttachmentsProps) => {
  if (attachments.length === 0) {
    return <p className="text-muted-foreground">No resources available for this lesson.</p>;
  }

  return (
    <div className="space-y-3">
      {attachments.map((attachment) => (
        <a 
          key={attachment.id} 
          href={attachment.file_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center p-3 border rounded-lg hover:bg-muted transition-colors"
        >
          <FileText className="h-5 w-5 mr-3 text-primary" />
          <div>
            <p className="font-medium">{attachment.name}</p>
            <p className="text-xs text-muted-foreground">{attachment.type}</p>
          </div>
        </a>
      ))}
    </div>
  );
};

export default LessonAttachments;
