
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
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings } from 'lucide-react';
import UserDetailsDialog, { UserWithRole } from '@/components/admin/users/UserDetailsDialog';

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Use RPC to call the get_auth_users function instead of querying the view
      const { data: authUsers, error: authError } = await supabase
        .rpc('get_auth_users');
      
      if (authError) throw authError;
      
      if (!authUsers || authUsers.length === 0) {
        setUsers([]);
        setIsLoading(false);
        return;
      }
      
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
      
      // Format the user data with roles
      const formattedUsers = authUsers.map(authUser => {
        // Find matching profile
        const profile = profilesWithRoles?.find(p => p.id === authUser.id) || {
          first_name: null,
          last_name: null,
          created_at: new Date().toISOString(),
          user_roles: [] // Add empty user_roles to avoid TypeScript errors
        };
        
        // Determine the role
        let role: 'admin' | 'instructor' | 'student' = 'student';
        if (profile.user_roles && profile.user_roles.length > 0) {
          const userRole = profile.user_roles[0] as unknown as { role: typeof role };
          role = userRole.role;
        }
        
        return {
          id: authUser.id,
          email: authUser.email || 'No email available',
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: role,
          created_at: authUser.created_at || new Date().toISOString()
        };
      });
      
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

  const openUserDialog = (user: UserWithRole) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleUserUpdated = (updatedUser: UserWithRole) => {
    // Update the local state with the modified user
    setUsers(users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
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
                    <Button variant="ghost" size="icon" onClick={() => openUserDialog(user)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <UserDetailsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
};

export default UserManagement;
