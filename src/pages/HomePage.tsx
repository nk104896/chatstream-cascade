
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Bell, Link, Search, LayoutGrid, List, Lock, Rocket } from "lucide-react";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate("/chat");
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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
              className="font-medium text-muted-foreground hover:text-foreground transition-colors"
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
              onClick={() => handleNavigation("/chat")}
            >
              Go to Chat
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center min-h-[90vh]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_50%,var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mb-6">
          Seamless Multi-Chat. Effortless Communication.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10">
          Manage multiple conversations with ease, stay organized, and boost productivity—all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button size="lg" onClick={handleGetStarted} className="text-base px-8">
            Get Started
          </Button>
          <Button size="lg" variant="outline" onClick={scrollToFeatures} className="text-base px-8">
            Learn More
          </Button>
        </div>
        <div className="relative w-full max-w-5xl">
          <div className="aspect-video rounded-lg overflow-hidden shadow-2xl bg-card border">
            {/* This would ideally be an image or animation of the chat interface */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl text-muted-foreground">
                Chat Interface Preview
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Multi-Chat */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What is Multi-Chat?</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg mb-6">
                Multi-chat enables users to manage multiple conversations in a single platform without switching between different apps. Whether you're collaborating with teams, handling customer support, or chatting with friends, our platform keeps your conversations organized and accessible.
              </p>
              <p className="text-lg">
                Say goodbye to the frustration of juggling multiple chat windows and missing important messages. Our intuitive interface makes it easy to stay on top of all your communications.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg border bg-card">
              {/* This would ideally be an illustration showing multiple chat windows */}
              <div className="aspect-[4/3] flex items-center justify-center">
                <div className="text-xl text-muted-foreground">
                  Multi-Chat Illustration
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Key Features</h2>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-16">
            How our multi-chat system transforms your communication experience
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<LayoutGrid />}
              title="Multi-Window Chat Management"
              description="Easily switch between conversations without losing context."
            />
            <FeatureCard 
              icon={<Bell />}
              title="Smart Notifications"
              description="Get alerts only for important messages."
            />
            <FeatureCard 
              icon={<List />}
              title="Custom Chat Categories"
              description="Organize chats based on teams, topics, or projects."
            />
            <FeatureCard 
              icon={<Link />}
              title="Seamless Integration"
              description="Connect with apps like Slack, WhatsApp, Telegram, and more."
            />
            <FeatureCard 
              icon={<Search />}
              title="AI-Powered Suggestions"
              description="Smart replies and auto-sorting of chats."
            />
            <FeatureCard 
              icon={<Lock />}
              title="Secure & Private"
              description="End-to-end encryption and user control over data."
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Benefits of Our Multi-Chat System</h2>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-16">
            Why users love our platform compared to traditional chat applications
          </p>
          
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
            <BenefitItem
              emoji="🚀"
              title="Increased Productivity"
              description="No need to switch apps repeatedly, saving you valuable time."
            />
            <BenefitItem
              emoji="🔄"
              title="Effortless Collaboration"
              description="Keep personal and work chats separate but accessible."
            />
            <BenefitItem
              emoji="📅"
              title="Better Organization"
              description="Categorize and manage conversations efficiently."
            />
            <BenefitItem
              emoji="🛡️"
              title="Secure & Private"
              description="End-to-end encryption and complete user control over data."
            />
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How to Get Started</h2>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-16">
            Begin your multi-chat journey in just three simple steps
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title="Sign Up/Login"
              description="Create an account or sign in to access the platform."
            />
            <StepCard
              number={2}
              title="Connect Chats"
              description="Link different chat platforms or start new conversations."
            />
            <StepCard
              number={3}
              title="Start Communicating"
              description="Effortlessly manage multiple chats in one dashboard."
            />
          </div>
          
          <div className="mt-16 text-center">
            <Button size="lg" onClick={handleGetStarted} className="text-base px-8">
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">What Our Users Say</h2>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-16">
            Real feedback from people who use our platform every day
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <TestimonialCard
              quote="This platform changed how I handle customer chats—everything is in one place!"
              author="Sarah L."
              title="Business Owner"
            />
            <TestimonialCard
              quote="I manage five different team chats, and this tool has been a lifesaver for keeping everything organized."
              author="Marcus T."
              title="Project Manager"
            />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-16">
            Find answers to common questions about our multi-chat platform
          </p>
          
          <div className="space-y-6">
            <FaqItem
              question="How secure is my data?"
              answer="We use end-to-end encryption for all messages and don't store your conversations on our servers. Your privacy is our priority."
            />
            <FaqItem
              question="Can I integrate external apps?"
              answer="Yes! Our platform supports integration with popular messaging apps like Slack, Discord, WhatsApp, and more through our API."
            />
            <FaqItem
              question="Is there a free plan available?"
              answer="Absolutely. We offer a generous free tier that includes basic multi-chat functionality. Premium features are available in our paid plans."
            />
            <FaqItem
              question="How many conversations can I manage at once?"
              answer="Our platform is designed to handle unlimited conversations. The practical limit depends on your device's performance."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your chat experience?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Join thousands of users who have simplified their communication with our multi-chat platform.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={handleGetStarted}
            className="text-primary text-base px-8"
          >
            Start Chatting Now
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Multi-Chat AI</h3>
              <p className="text-muted-foreground">
                The ultimate multi-chat solution for seamless communication.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Links</h3>
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
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-start p-6 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

// Benefit Item Component
interface BenefitItemProps {
  emoji: string;
  title: string;
  description: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ emoji, title, description }) => {
  return (
    <div className="flex items-start">
      <div className="text-4xl mr-4">{emoji}</div>
      <div>
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

// Step Card Component
interface StepCardProps {
  number: number;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ number, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border">
      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

// Testimonial Card Component
interface TestimonialCardProps {
  quote: string;
  author: string;
  title: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, title }) => {
  return (
    <div className="p-6 rounded-lg bg-card border">
      <p className="text-lg italic mb-4">"{quote}"</p>
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary/20 mr-3"></div>
        <div>
          <p className="font-medium">{author}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
    </div>
  );
};

// FAQ Item Component
interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="flex justify-between items-center w-full p-4 text-left text-lg font-medium focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {question}
        <span className="ml-2">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t">
          <p className="text-muted-foreground">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
