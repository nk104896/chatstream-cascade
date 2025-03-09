import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Link2, Globe, Mic, Search, Lock, Palette, MessageSquare, FolderKanban } from "lucide-react";
import NavigationButton from "@/components/ui/NavigationButton";
import { useAuth } from "@/context/AuthContext";

const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="py-4 px-4 sm:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            className="text-xl font-bold"
            onClick={() => handleNavigation("/")}
          >
            Multi-Chat AI
          </button>
          <div className="flex items-center gap-6">
            <button 
              className="font-medium text-primary"
              onClick={() => handleNavigation("/features")}
            >
              Features
            </button>
            <button 
              className="font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => handleNavigation("/pricing")}
            >
              Pricing
            </button>
            <button 
              className="font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => handleNavigation("/about")}
            >
              About Us
            </button>
            <Button 
              size="sm" 
              onClick={() => isAuthenticated ? navigate("/chat") : navigate("/login")}
            >
              {isAuthenticated ? "Go to Chat" : "Login"}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            AI-Powered Multi-Chat: Smarter, Faster, Better.
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Experience intelligent chat management with AI-driven organization, automation, and integrations.
          </p>
          <NavigationButton 
            label="Try for Free" 
            size="lg" 
            className="text-base px-8"
          />
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Key Features</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FolderKanban />}
              title="Smart Chat Organization"
              emoji="🗂️"
              description="Automatically categorizes chats based on priority and context."
            />
            <FeatureCard 
              icon={<Bot />}
              title="AI-Powered Replies"
              emoji="🤖"
              description="Suggests responses and auto-completes messages."
            />
            <FeatureCard 
              icon={<Link2 />}
              title="Multi-Platform Integration"
              emoji="🔗"
              description="Connects with WhatsApp, Slack, Telegram, Messenger, and more."
            />
            <FeatureCard 
              icon={<Globe />}
              title="Real-Time Language Translation"
              emoji="🌍"
              description="Instantly translates messages for seamless global communication."
            />
            <FeatureCard 
              icon={<Mic />}
              title="Voice-to-Text & Text-to-Voice"
              emoji="🎙️"
              description="Converts voice messages to text and vice versa."
            />
            <FeatureCard 
              icon={<Search />}
              title="Advanced Search & Filters"
              emoji="🔍"
              description="Find messages instantly using AI-powered search."
            />
            <FeatureCard 
              icon={<Lock />}
              title="Privacy & Security"
              emoji="🔒"
              description="End-to-end encryption with user-controlled data."
            />
            <FeatureCard 
              icon={<Palette />}
              title="Customization & Themes"
              emoji="🎨"
              description="Personalize your chat experience with themes and layouts."
            />
          </div>
        </div>
      </section>

      {/* Feature Demonstration */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">See AI Features in Action</h2>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-16">
            Our platform makes managing multiple conversations intelligent and effortless.
          </p>
          
          <div className="grid md:grid-cols-2 gap-16">
            <DemoCard 
              title="Smart Organization" 
              description="AI automatically categorizes and prioritizes your chats."
            />
            <DemoCard 
              title="Intelligent Replies" 
              description="Get AI-powered suggestions based on conversation context."
            />
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Chat Smarter?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Join thousands of users who have transformed their communication experience with our AI-powered platform.
          </p>
          <NavigationButton 
            label="Start Chatting Smarter"
            size="lg" 
            variant="secondary" 
            className="text-primary text-base px-8"
            icon={<ArrowRight className="ml-2" />}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Multi-Chat AI</h3>
              <p className="text-muted-foreground">
                The intelligent multi-chat solution for seamless communication.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li><button onClick={() => handleNavigation("/")} className="text-muted-foreground hover:text-foreground">Home</button></li>
                <li><button onClick={() => handleNavigation("/features")} className="text-muted-foreground hover:text-foreground">Features</button></li>
                <li><button onClick={() => handleNavigation("/pricing")} className="text-muted-foreground hover:text-foreground">Pricing</button></li>
                <li><button onClick={() => handleNavigation("/about")} className="text-muted-foreground hover:text-foreground">About Us</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><button className="text-muted-foreground hover:text-foreground">Privacy Policy</button></li>
                <li><button className="text-muted-foreground hover:text-foreground">Terms of Service</button></li>
                <li><button className="text-muted-foreground hover:text-foreground">Cookie Policy</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <ul className="space-y-2">
                <li><button className="text-muted-foreground hover:text-foreground">Support</button></li>
                <li><button className="text-muted-foreground hover:text-foreground">Sales</button></li>
                <li><button className="text-muted-foreground hover:text-foreground">Partnership</button></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Multi-Chat AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  emoji: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, emoji, description }) => {
  return (
    <div className="flex flex-col p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-full bg-primary/10 text-primary mr-3">
          {icon}
        </div>
        <span className="text-2xl">{emoji}</span>
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

// Demo Card Component
interface DemoCardProps {
  title: string;
  description: string;
}

const DemoCard: React.FC<DemoCardProps> = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg bg-card border mb-6">
        <div className="w-full h-full flex items-center justify-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground/50" />
        </div>
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-center">{description}</p>
    </div>
  );
};

export default FeaturesPage;
