
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileContainer from '@/components/profile/ProfileContainer';

const Profile = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-20 flex-grow">
        <h1 className="text-3xl font-bold gradient-text mb-8">Your Profile</h1>
        <ProfileContainer />
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
