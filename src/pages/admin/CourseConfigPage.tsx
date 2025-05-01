
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash,
  Plus,
  Copy,
  GripVertical,
  FilePlus,
  FolderPlus
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface Course {
  id: string;
  title: string;
  description: string;
}

interface Module {
  id: string;
  title: string;
  sort_order: number;
  course_id: string;
  isExpanded?: boolean;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  module_id: string | null;
  course_id: string;
  video_url: string | null;
}

const CourseConfigPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  const [moduleForm, setModuleForm] = useState({
    title: '',
  });
  
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    moduleId: '',
    videoUrl: '',
  });

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, title, description')
        .eq('id', courseId)
        .single();
      
      if (courseError) throw courseError;
      setCourse(courseData);
      
      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });
      
      if (modulesError) throw modulesError;
      
      // Add isExpanded property to modules
      const expandedModules = modulesData?.map(module => ({
        ...module,
        isExpanded: true
      })) || [];
      
      setModules(expandedModules);
      
      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });
      
      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);
      
    } catch (error: any) {
      toast({
        title: "Error loading course data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModuleToggle = (moduleId: string) => {
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, isExpanded: !module.isExpanded } : module
    ));
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const maxSortOrder = modules.length > 0
        ? Math.max(...modules.map(module => module.sort_order))
        : 0;
      
      const newModule = {
        title: moduleForm.title,
        course_id: courseId,
        sort_order: maxSortOrder + 1
      };
      
      const { data, error } = await supabase
        .from('modules')
        .insert(newModule)
        .select()
        .single();
      
      if (error) throw error;
      
      setModules([...modules, { ...data, isExpanded: true }]);
      setModuleForm({ title: '' });
      setIsModuleDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Chapter added successfully",
      });
      
    } catch (error: any) {
      toast({
        title: "Error adding chapter",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditModule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedModule) return;
    
    try {
      const { error } = await supabase
        .from('modules')
        .update({ title: moduleForm.title })
        .eq('id', selectedModule.id);
      
      if (error) throw error;
      
      setModules(modules.map(module => 
        module.id === selectedModule.id ? { ...module, title: moduleForm.title } : module
      ));
      
      setModuleForm({ title: '' });
      setSelectedModule(null);
      setIsModuleDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Chapter updated successfully",
      });
      
    } catch (error: any) {
      toast({
        title: "Error updating chapter",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this chapter? This will also delete all lessons in this chapter.")) {
      return;
    }
    
    try {
      // Delete all lessons in the module first
      const moduleLessons = lessons.filter(lesson => lesson.module_id === moduleId);
      
      if (moduleLessons.length > 0) {
        const lessonIds = moduleLessons.map(lesson => lesson.id);
        const { error: lessonsError } = await supabase
          .from('lessons')
          .delete()
          .in('id', lessonIds);
        
        if (lessonsError) throw lessonsError;
      }
      
      // Then delete the module
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);
      
      if (error) throw error;
      
      setModules(modules.filter(module => module.id !== moduleId));
      setLessons(lessons.filter(lesson => lesson.module_id !== moduleId));
      
      toast({
        title: "Success",
        description: "Chapter deleted successfully",
      });
      
    } catch (error: any) {
      toast({
        title: "Error deleting chapter",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const moduleId = lessonForm.moduleId || null;
      
      // Get max sort order for lessons in this module
      const moduleLessons = lessons.filter(lesson => lesson.module_id === moduleId);
      const maxSortOrder = moduleLessons.length > 0
        ? Math.max(...moduleLessons.map(lesson => lesson.sort_order))
        : 0;
      
      const newLesson = {
        title: lessonForm.title,
        description: lessonForm.description || null,
        video_url: lessonForm.videoUrl || null,
        course_id: courseId,
        module_id: moduleId,
        sort_order: maxSortOrder + 1
      };
      
      const { data, error } = await supabase
        .from('lessons')
        .insert(newLesson)
        .select()
        .single();
      
      if (error) throw error;
      
      setLessons([...lessons, data]);
      setLessonForm({
        title: '',
        description: '',
        moduleId: '',
        videoUrl: ''
      });
      setIsLessonDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Lesson added successfully",
      });
      
    } catch (error: any) {
      toast({
        title: "Error adding lesson",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLesson) return;
    
    try {
      const updatedLesson = {
        title: lessonForm.title,
        description: lessonForm.description || null,
        video_url: lessonForm.videoUrl || null,
        module_id: lessonForm.moduleId || null
      };
      
      const { error } = await supabase
        .from('lessons')
        .update(updatedLesson)
        .eq('id', selectedLesson.id);
      
      if (error) throw error;
      
      setLessons(lessons.map(lesson => 
        lesson.id === selectedLesson.id ? { ...lesson, ...updatedLesson } : lesson
      ));
      
      setLessonForm({
        title: '',
        description: '',
        moduleId: '',
        videoUrl: ''
      });
      setSelectedLesson(null);
      setIsLessonDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Lesson updated successfully",
      });
      
    } catch (error: any) {
      toast({
        title: "Error updating lesson",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);
      
      if (error) throw error;
      
      setLessons(lessons.filter(lesson => lesson.id !== lessonId));
      
      toast({
        title: "Success",
        description: "Lesson deleted successfully",
      });
      
    } catch (error: any) {
      toast({
        title: "Error deleting lesson",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const editModule = (module: Module) => {
    setSelectedModule(module);
    setModuleForm({ title: module.title });
    setIsModuleDialogOpen(true);
  };

  const editLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      moduleId: lesson.module_id || '',
      videoUrl: lesson.video_url || ''
    });
    setIsLessonDialogOpen(true);
  };

  const moveModuleUp = async (moduleId: string) => {
    const currentIndex = modules.findIndex(module => module.id === moduleId);
    if (currentIndex === 0) return;
    
    const previousModule = modules[currentIndex - 1];
    const currentModule = modules[currentIndex];
    
    try {
      // Swap sort orders
      const updates = [
        { id: previousModule.id, sort_order: currentModule.sort_order },
        { id: currentModule.id, sort_order: previousModule.sort_order }
      ];
      
      for (const update of updates) {
        const { error } = await supabase
          .from('modules')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
        
        if (error) throw error;
      }
      
      // Update local state
      const newModules = [...modules];
      [newModules[currentIndex - 1], newModules[currentIndex]] = [newModules[currentIndex], newModules[currentIndex - 1]];
      setModules(newModules);
      
    } catch (error: any) {
      toast({
        title: "Error moving chapter",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const moveModuleDown = async (moduleId: string) => {
    const currentIndex = modules.findIndex(module => module.id === moduleId);
    if (currentIndex === modules.length - 1) return;
    
    const nextModule = modules[currentIndex + 1];
    const currentModule = modules[currentIndex];
    
    try {
      // Swap sort orders
      const updates = [
        { id: nextModule.id, sort_order: currentModule.sort_order },
        { id: currentModule.id, sort_order: nextModule.sort_order }
      ];
      
      for (const update of updates) {
        const { error } = await supabase
          .from('modules')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
        
        if (error) throw error;
      }
      
      // Update local state
      const newModules = [...modules];
      [newModules[currentIndex], newModules[currentIndex + 1]] = [newModules[currentIndex + 1], newModules[currentIndex]];
      setModules(newModules);
      
    } catch (error: any) {
      toast({
        title: "Error moving chapter",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const moveLessonUp = async (lessonId: string) => {
    const currentLesson = lessons.find(lesson => lesson.id === lessonId);
    if (!currentLesson) return;
    
    const moduleLessons = lessons
      .filter(lesson => lesson.module_id === currentLesson.module_id)
      .sort((a, b) => a.sort_order - b.sort_order);
    
    const currentIndex = moduleLessons.findIndex(lesson => lesson.id === lessonId);
    if (currentIndex === 0) return;
    
    const previousLesson = moduleLessons[currentIndex - 1];
    
    try {
      // Swap sort orders
      const updates = [
        { id: previousLesson.id, sort_order: currentLesson.sort_order },
        { id: currentLesson.id, sort_order: previousLesson.sort_order }
      ];
      
      for (const update of updates) {
        const { error } = await supabase
          .from('lessons')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
        
        if (error) throw error;
      }
      
      // Update local state
      setLessons(lessons.map(lesson => {
        if (lesson.id === currentLesson.id) {
          return { ...lesson, sort_order: previousLesson.sort_order };
        } else if (lesson.id === previousLesson.id) {
          return { ...lesson, sort_order: currentLesson.sort_order };
        }
        return lesson;
      }));
      
    } catch (error: any) {
      toast({
        title: "Error moving lesson",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const moveLessonDown = async (lessonId: string) => {
    const currentLesson = lessons.find(lesson => lesson.id === lessonId);
    if (!currentLesson) return;
    
    const moduleLessons = lessons
      .filter(lesson => lesson.module_id === currentLesson.module_id)
      .sort((a, b) => a.sort_order - b.sort_order);
    
    const currentIndex = moduleLessons.findIndex(lesson => lesson.id === lessonId);
    if (currentIndex === moduleLessons.length - 1) return;
    
    const nextLesson = moduleLessons[currentIndex + 1];
    
    try {
      // Swap sort orders
      const updates = [
        { id: nextLesson.id, sort_order: currentLesson.sort_order },
        { id: currentLesson.id, sort_order: nextLesson.sort_order }
      ];
      
      for (const update of updates) {
        const { error } = await supabase
          .from('lessons')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
        
        if (error) throw error;
      }
      
      // Update local state
      setLessons(lessons.map(lesson => {
        if (lesson.id === currentLesson.id) {
          return { ...lesson, sort_order: nextLesson.sort_order };
        } else if (lesson.id === nextLesson.id) {
          return { ...lesson, sort_order: currentLesson.sort_order };
        }
        return lesson;
      }));
      
    } catch (error: any) {
      toast({
        title: "Error moving lesson",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderLessons = (moduleId: string) => {
    const moduleLessons = lessons
      .filter(lesson => lesson.module_id === moduleId)
      .sort((a, b) => a.sort_order - b.sort_order);
    
    if (moduleLessons.length === 0) {
      return (
        <div className="pl-8 py-2 text-sm text-muted-foreground">
          No lessons in this chapter
        </div>
      );
    }
    
    return moduleLessons.map((lesson) => (
      <div key={lesson.id} className="pl-8 py-2 flex items-center space-x-2 border-b last:border-b-0 border-muted text-sm">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <div className="flex-grow flex items-center">
          <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></div>
          {lesson.title}
          {lesson.video_url && (
            <span className="ml-2 text-xs text-muted-foreground">
              (Has video)
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6"
            onClick={() => moveLessonUp(lesson.id)}
            disabled={moduleLessons.indexOf(lesson) === 0}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6"
            onClick={() => moveLessonDown(lesson.id)}
            disabled={moduleLessons.indexOf(lesson) === moduleLessons.length - 1}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => editLesson(lesson)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteLesson(lesson.id)}>
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      </div>
    ));
  };

  const openAddLessonDialog = (moduleId: string) => {
    setLessonForm({
      ...lessonForm,
      moduleId: moduleId
    });
    setIsLessonDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/admin/courses')}>
              Back to Courses
            </Button>
            <h1 className="text-2xl font-bold">
              {course ? course.title : 'Configure Course'}
            </h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Copy link
            </Button>
            <Button>
              Saved
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 p-4 border-2 min-h-[600px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Chapters</h2>
                <Button variant="outline" size="sm" onClick={() => setIsModuleDialogOpen(true)}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New chapter
                </Button>
              </div>
              
              <div className="space-y-2">
                {modules.map((module) => (
                  <div key={module.id} className="border rounded-md">
                    <div className="flex items-center justify-between p-2 bg-muted/30">
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 mr-1"
                          onClick={() => handleModuleToggle(module.id)}
                        >
                          {module.isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronUp className="h-4 w-4" />
                          )}
                        </Button>
                        <span className="font-medium">{module.title}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveModuleUp(module.id)}
                          disabled={modules.indexOf(module) === 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveModuleDown(module.id)}
                          disabled={modules.indexOf(module) === modules.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => openAddLessonDialog(module.id)}
                        >
                          <FilePlus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => editModule(module)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDeleteModule(module.id)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {module.isExpanded && (
                      <div className="border-t">
                        {renderLessons(module.id)}
                        <div className="p-2">
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="w-full border border-dashed text-muted-foreground"
                            onClick={() => openAddLessonDialog(module.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            New lesson
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {modules.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No chapters created yet</p>
                  <Button onClick={() => setIsModuleDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add your first chapter
                  </Button>
                </div>
              )}
            </Card>
            
            <Card className="lg:col-span-2 p-4 border-2 min-h-[600px]">
              <h2 className="text-lg font-bold mb-4">Lesson Content</h2>
              <p className="text-muted-foreground">
                Select a lesson to edit its content
              </p>
            </Card>
          </div>
        )}
      </div>
      
      {/* Module Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedModule ? 'Edit Chapter' : 'Add New Chapter'}</DialogTitle>
            <DialogDescription>
              {selectedModule 
                ? 'Update the chapter details.' 
                : 'Enter a name for your new chapter.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={selectedModule ? handleEditModule : handleAddModule}>
            <div className="py-4">
              <Label htmlFor="title">Chapter Title</Label>
              <Input
                id="title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="Enter chapter title"
                className="mt-1"
                required
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModuleDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedModule ? 'Save Changes' : 'Create Chapter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedLesson ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
            <DialogDescription>
              {selectedLesson 
                ? 'Update the lesson details.' 
                : 'Enter details for your new lesson.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={selectedLesson ? handleEditLesson : handleAddLesson}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="lessonTitle">Lesson Title</Label>
                <Input
                  id="lessonTitle"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="Enter lesson title"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="moduleSelect">Chapter</Label>
                <select
                  id="moduleSelect"
                  value={lessonForm.moduleId}
                  onChange={(e) => setLessonForm({ ...lessonForm, moduleId: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                >
                  <option value="">Select a chapter</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  placeholder="Brief description of this lesson"
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="videoUrl">Video URL (Optional)</Label>
                <Input
                  id="videoUrl"
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  placeholder="https://vimeo.com/123456789"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supports Vimeo or YouTube video URLs
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedLesson ? 'Save Changes' : 'Create Lesson'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default CourseConfigPage;
