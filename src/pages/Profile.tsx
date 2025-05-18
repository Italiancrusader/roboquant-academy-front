
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, Mail, Phone, Globe, Briefcase, MapPin, AlertCircle, Shield, Key } from 'lucide-react';
import Footer from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';

// Update interface to include all fields used in the component
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  website: string | null;
  company: string | null;
  location: string | null;
  updated_at: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          // Create a complete profile object with all required fields
          const fetchedProfile: Profile = {
            id: data.id,
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            avatar_url: data.avatar_url,
            // Handle potentially missing fields that were added with schema updates
            bio: data.bio || '',
            phone: data.phone || '',
            website: data.website || '',
            company: data.company || '',
            location: data.location || '',
            updated_at: data.updated_at
          };
          
          setProfile(fetchedProfile);
          setFirstName(fetchedProfile.first_name || '');
          setLastName(fetchedProfile.last_name || '');
          setBio(fetchedProfile.bio || '');
          setPhone(fetchedProfile.phone || '');
          setWebsite(fetchedProfile.website || '');
          setCompany(fetchedProfile.company || '');
          setLocation(fetchedProfile.location || '');
        }
      } catch (error: any) {
        toast({
          title: "Error fetching profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          bio,
          phone,
          website,
          company,
          location,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      // Update local profile state
      if (profile) {
        setProfile({
          ...profile,
          first_name: firstName,
          last_name: lastName,
          bio,
          phone,
          website,
          company,
          location,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-20 flex-grow">
        <h1 className="text-3xl font-bold gradient-text mb-8">Your Profile</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleUpdateProfile}>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="firstName" className="text-sm font-medium">
                            First Name
                          </label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="lastName" className="text-sm font-medium">
                            Last Name
                          </label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter your last name"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email
                        </label>
                        <Input
                          id="email"
                          value={user?.email || ''}
                          readOnly
                          disabled
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="bio" className="text-sm font-medium">
                          Bio
                        </label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us a little about yourself"
                          rows={4}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                            <Phone className="h-4 w-4" /> Phone
                          </label>
                          <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Your phone number"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="website" className="text-sm font-medium flex items-center gap-2">
                            <Globe className="h-4 w-4" /> Website
                          </label>
                          <Input
                            id="website"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="Your website URL"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="company" className="text-sm font-medium flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Company
                          </label>
                          <Input
                            id="company"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="Where you work"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Location
                          </label>
                          <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="City, Country"
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button className="cta-button" type="submit" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Your account details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Account Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p>{profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}</p>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          Sign Out
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You will need to sign back in to access your account and course content.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => signOut()}>Sign Out</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Email Preferences</CardTitle>
                <CardDescription>Manage your email notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  Email preference settings coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>Manage your account security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">Change Password</h4>
                      <p className="text-sm text-muted-foreground">
                        Update your password to keep your account secure
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="ml-auto"
                      disabled={true}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      Coming Soon
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <AlertCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="ml-auto"
                      disabled={true}
                    >
                      Coming Soon
                    </Button>
                  </div>

                  <Separator />
                  
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">Active Sessions</h4>
                      <p className="text-sm text-muted-foreground">
                        Manage all devices where you're currently logged in
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="ml-auto"
                      disabled={true}
                    >
                      Coming Soon
                    </Button>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          Sign Out
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You will need to sign back in to access your account and course content.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => signOut()}>Sign Out</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
