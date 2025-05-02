
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CourseModuleForm from './CourseModuleForm';
import LessonForm from './LessonForm';
import { Module, Lesson } from '@/types/courses';

interface ModuleDialogsProps {
  courseId: string;
  isModuleDialogOpen: boolean;
  setIsModuleDialogOpen: (open: boolean) => void;
  isLessonDialogOpen: boolean;
  setIsLessonDialogOpen: (open: boolean) => void;
  selectedModule?: Module;
  selectedLesson?: Lesson;
  onRefresh: () => void;
}

const ModuleDialogs: React.FC<ModuleDialogsProps> = ({
  courseId,
  isModuleDialogOpen,
  setIsModuleDialogOpen,
  isLessonDialogOpen,
  setIsLessonDialogOpen,
  selectedModule,
  selectedLesson,
  onRefresh,
}) => {
  return (
    <>
      {/* Module Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedModule ? 'Edit Module' : 'Add New Module'}</DialogTitle>
          </DialogHeader>
          <CourseModuleForm 
            courseId={courseId} 
            module={selectedModule} 
            onSuccess={() => { onRefresh(); setIsModuleDialogOpen(false); }}
            onCancel={() => setIsModuleDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedLesson?.id ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
          </DialogHeader>
          <LessonForm 
            courseId={courseId} 
            lesson={selectedLesson} 
            onSuccess={() => { onRefresh(); setIsLessonDialogOpen(false); }}
            onCancel={() => setIsLessonDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModuleDialogs;
