
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import TabView from '@/components/ui/tab-view';
import PersonalInfoSection from './PersonalInfoSection';
import PreferencesSection from './PreferencesSection';
import AccountSecuritySection from './AccountSecuritySection';

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

const ProfileContainer = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleProfileUpdate = (updatedData: Partial<Profile>) => {
    if (profile) {
      setProfile({
        ...profile,
        ...updatedData
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  const tabs = [
    {
      id: "personal",
      label: "Personal Info",
      content: (
        <PersonalInfoSection
          firstName={profile?.first_name || ''}
          lastName={profile?.last_name || ''}
          bio={profile?.bio || ''}
          phone={profile?.phone || ''}
          website={profile?.website || ''}
          company={profile?.company || ''}
          location={profile?.location || ''}
          userEmail={user?.email}
          userId={user?.id || ''}
          onUpdate={handleProfileUpdate}
        />
      )
    },
    {
      id: "preferences",
      label: "Preferences",
      content: <PreferencesSection />
    },
    {
      id: "account",
      label: "Account",
      content: (
        <AccountSecuritySection 
          userEmail={user?.email} 
          signOut={signOut}
        />
      )
    }
  ];

  return (
    <TabView tabs={tabs} defaultTab="personal" />
  );
};

export default ProfileContainer;
