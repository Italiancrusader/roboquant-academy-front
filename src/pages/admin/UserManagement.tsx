
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings } from 'lucide-react';

// Define the valid role types
type UserRole = 'admin' | 'instructor' | 'student';

// Define the shape of user_roles data from Supabase
interface UserRoleData {
  role: UserRole;
}

interface UserWithRole {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Get profiles with user_role data using a join
      const { data: profilesWithRoles, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          first_name, 
          last_name,
          created_at,
          user_roles!user_roles_user_id_fkey (
            role
          )
        `);
      
      if (error) throw error;
      
      if (!profilesWithRoles || profilesWithRoles.length === 0) {
        setUsers([]);
        setIsLoading(false);
        return;
      }
      
      // We also need to get email addresses from our new auth_users_view
      // Format the user data with roles
      const formattedUsers = await Promise.all(profilesWithRoles.map(async (profile) => {
        // Get user's email from auth_users_view
        let email = null;
        try {
          // Try to get the email from our view
          const { data: userData, error: userError } = await supabase
            .from('auth_users_view')
            .select('email')
            .eq('id', profile.id)
            .single();
          
          if (!userError && userData) {
            email = userData.email;
          }
        } catch (emailError) {
          console.error("Unable to fetch email:", emailError);
        }
        
        // Determine the role
        let role: UserRole = 'student';
        if (profile.user_roles && profile.user_roles.length > 0) {
          // Fix: Properly type and access the role property
          const userRole = profile.user_roles[0] as unknown as UserRoleData;
          role = userRole.role;
        }
        
        return {
          id: profile.id,
          email: email || 'No email available',
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: role,
          created_at: profile.created_at || new Date().toISOString()
        };
      }));
      
      setUsers(formattedUsers);
      
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error fetching users",
        description: error.message || "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openRoleDialog = (user: UserWithRole) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsDialogOpen(true);
  };

  const updateUserRole = async () => {
    if (!selectedUser || !selectedRole) return;
    
    try {
      // Check if user already has this role
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', selectedUser.id)
        .eq('role', selectedRole);
        
      if (checkError) throw checkError;
      
      if (existingRole && existingRole.length > 0) {
        // User already has this role, no need to update
        setIsDialogOpen(false);
        return;
      }
      
      // Delete any existing roles for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id);
        
      if (deleteError) throw deleteError;
      
      // Insert the new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: selectedUser.id,
          role: selectedRole
        });
        
      if (insertError) throw insertError;
      
      toast({
        title: "Role updated",
        description: `User role has been updated to ${selectedRole}.`,
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, role: selectedRole } : user
      ));
      
      setIsDialogOpen(false);
      
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : users.length === 0 ? (
        <Alert className="mb-6">
          <AlertDescription>
            No users found. This could be due to insufficient permissions or no users in the system.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    {user.first_name || user.last_name ? 
                      `${user.first_name || ''} ${user.last_name || ''}`.trim() : 
                      'No name provided'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      user.role === 'admin' ? 'default' :
                      user.role === 'instructor' ? 'outline' : 'secondary'
                    }>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openRoleDialog(user)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
            <DialogDescription>
              Change the role for user: {selectedUser?.email}
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={updateUserRole}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
