
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// Define the valid role types
export type UserRole = 'admin' | 'instructor' | 'student';

export interface UserWithRole {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  created_at: string;
}

interface UserDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithRole | null;
  onUserUpdated: (updatedUser: UserWithRole) => void;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || "student");
  const [isLoading, setIsLoading] = useState(false);

  // Reset selected role when the user changes
  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const updateUserRole = async () => {
    if (!user || !selectedRole) return;
    
    try {
      setIsLoading(true);
      
      // Check if user already has this role
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', selectedRole);
        
      if (checkError) throw checkError;
      
      if (existingRole && existingRole.length > 0) {
        // User already has this role, no need to update
        onClose();
        return;
      }
      
      // Delete any existing roles for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);
        
      if (deleteError) throw deleteError;
      
      // Insert the new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: selectedRole
        });
        
      if (insertError) throw insertError;
      
      toast({
        title: "Role updated",
        description: `User role has been updated to ${selectedRole}.`,
      });
      
      // Update local state via callback
      onUserUpdated({
        ...user,
        role: selectedRole
      });
      
      onClose();
      
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User Role</DialogTitle>
          <DialogDescription>
            Change the role for user: {user?.email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Roles</SelectLabel>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={updateUserRole}
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
