
import React from 'react';
import Navbar from '@/components/Navbar';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, MapPin, Phone } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-20">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4 text-center">Contact Us</h1>
        <p className="text-lg text-center max-w-2xl mx-auto mb-12 text-muted-foreground">
          Have questions or want to learn more about RoboQuant Academy? We're here to help!
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Mail className="h-10 w-10 mb-4 text-blue-primary" />
              <h3 className="text-lg font-semibold mb-2">Email Us</h3>
              <p className="text-muted-foreground">support@roboquantacademy.com</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Phone className="h-10 w-10 mb-4 text-blue-primary" />
              <h3 className="text-lg font-semibold mb-2">Call Us</h3>
              <p className="text-muted-foreground">+1 (555) 123-4567</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <MapPin className="h-10 w-10 mb-4 text-blue-primary" />
              <h3 className="text-lg font-semibold mb-2">Office</h3>
              <p className="text-muted-foreground">123 Trading St, Algo City, AC 12345</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <ContactForm />
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
