
import React from 'react';
import { Label } from '@/components/ui/label';
import { Module } from '@/types/courses';

interface ModuleSelectorProps {
  moduleId?: string;
  modules: Module[];
  onChange: (moduleId: string | undefined) => void;
}

const ModuleSelector = ({ moduleId, modules, onChange }: ModuleSelectorProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="module">Module</Label>
      <select
        id="module"
        value={moduleId || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="w-full rounded-md border border-input bg-background px-3 py-2"
      >
        <option value="">No Module (Standalone Lesson)</option>
        {modules.map((module) => (
          <option key={module.id} value={module.id}>
            {module.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ModuleSelector;
