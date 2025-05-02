
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Loader2, MessageCircle, UserCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Community = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discussions');

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from the discussions table
      // For now, we'll use mock data
      const mockDiscussions = [
        {
          id: '1',
          title: 'Getting started with algo trading',
          content: 'What are the best resources for beginners in algorithmic trading?',
          created_at: new Date('2025-04-28').toISOString(),
          user: { first_name: 'John', last_name: 'Doe' },
          replies_count: 12
        },
        {
          id: '2',
          title: 'MT5 Report Genie questions',
          content: 'How can I interpret the drawdown analysis in MT5 Report Genie?',
          created_at: new Date('2025-04-30').toISOString(),
          user: { first_name: 'Jane', last_name: 'Smith' },
          replies_count: 5
        },
        {
          id: '3',
          title: 'Trading bot optimization',
          content: 'What parameters should I focus on when optimizing my first trading bot?',
          created_at: new Date('2025-05-01').toISOString(),
          user: { first_name: 'Mike', last_name: 'Johnson' },
          replies_count: 8
        }
      ];
      
      setDiscussions(mockDiscussions);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a discussion",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would create a new discussion
      // For now, we'll just show a toast
      toast({
        title: "Discussion created",
        description: "Your discussion has been posted.",
      });
      
      // Reset form
      setTitle('');
      setContent('');
      
      // Add mock discussion to state
      const newDiscussion = {
        id: Date.now().toString(),
        title,
        content,
        created_at: new Date().toISOString(),
        user: { 
          first_name: user?.user_metadata?.first_name || 'Anonymous', 
          last_name: user?.user_metadata?.last_name || 'User' 
        },
        replies_count: 0
      };
      
      setDiscussions([newDiscussion, ...discussions]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-20">
        <h1 className="text-3xl font-bold gradient-text mb-4">Community Forum</h1>
        <p className="text-lg mb-8 text-muted-foreground">
          Connect with fellow traders and exchange ideas.
        </p>
        
        <Alert className="mb-8">
          <AlertTitle className="text-blue-primary">Beta Feature</AlertTitle>
          <AlertDescription>
            The community forum is currently in beta. Full functionality coming soon!
          </AlertDescription>
        </Alert>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="discussions">Discussions</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
              </TabsList>
              
              <TabsContent value="discussions">
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : discussions.length > 0 ? (
                    discussions.map((discussion) => (
                      <Card key={discussion.id} className="hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4">
                          <h3 className="text-lg font-semibold mb-2">{discussion.title}</h3>
                          <p className="text-muted-foreground mb-4 line-clamp-2">{discussion.content}</p>
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <UserCircle2 className="h-4 w-4" />
                              <span>{discussion.user.first_name} {discussion.user.last_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageCircle className="h-4 w-4" />
                              <span>{discussion.replies_count} replies</span>
                            </div>
                            <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground mb-4">No discussions yet. Be the first to create one!</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="popular">
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Coming soon!</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="announcements">
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No announcements yet.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Create Discussion</CardTitle>
                <CardDescription>
                  Share your ideas with the community
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateDiscussion}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Title
                    </label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Discussion title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium">
                      Content
                    </label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      placeholder="Share your thoughts..."
                      rows={5}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || !user}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : "Create Discussion"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            {!user && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  You need to be signed in to create discussions.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Community;
