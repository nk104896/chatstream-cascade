
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleContactUs = () => {
    // In a real application, this would open a contact form
    window.open("mailto:contact@multichat-ai.com", "_blank");
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
              className="font-medium text-primary"
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Building the Future of Smart Conversations
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our mission is to make communication seamless, efficient, and AI-powered.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Who We Are</h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg mb-6">
                At Multi-Chat AI, we believe in smarter communication. Our AI-driven platform empowers users to manage multiple conversations with ease, increasing productivity and enhancing collaboration.
              </p>
              <p className="text-lg mb-6">
                Founded in 2023 and headquartered in San Francisco, we're a team of passionate engineers, designers, and AI specialists dedicated to transforming how people communicate in the digital age.
              </p>
              <p className="text-lg">
                With over 500,000 users and growing, Multi-Chat AI has been featured in TechCrunch, Wired, and Forbes as one of the most innovative communication platforms of the year.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg bg-card border">
              <div className="aspect-square flex items-center justify-center bg-muted">
                <div className="text-4xl">🚀</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission & Vision */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Mission & Vision</h2>
          
          <div className="grid md:grid-cols-2 gap-16 text-center">
            <div className="bg-card rounded-lg p-8 border shadow-sm">
              <h3 className="text-2xl font-bold mb-4">Mission</h3>
              <p className="text-lg">
                To revolutionize digital communication with AI-powered automation, organization, and intelligence.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-8 border shadow-sm">
              <h3 className="text-2xl font-bold mb-4">Vision</h3>
              <p className="text-lg">
                A world where communication is instant, intelligent, and effortless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Meet the Team</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <TeamMember 
              name="Alex Johnson"
              title="CEO & Co-Founder"
              bio="Former AI Research Lead at Google with 15+ years in machine learning and NLP."
            />
            <TeamMember 
              name="Sarah Chen"
              title="CTO & Co-Founder"
              bio="Full-stack engineer with experience at Meta and Slack, specializing in real-time communication systems."
            />
            <TeamMember 
              name="Michael Rodriguez"
              title="VP of Product"
              bio="Product visionary with previous experience leading teams at Zoom and Microsoft Teams."
            />
            <TeamMember 
              name="Olivia Kim"
              title="Head of AI"
              bio="PhD in Computational Linguistics with a focus on conversational AI and sentiment analysis."
            />
            <TeamMember 
              name="David Patel"
              title="Lead UX Designer"
              bio="Award-winning designer who previously worked on WhatsApp's interface and user experience."
            />
            <TeamMember 
              name="Emma Wilson"
              title="Head of Marketing"
              bio="Digital marketing expert who led growth at several successful SaaS startups."
            />
          </div>
        </div>
      </section>

      {/* Join Us - Careers */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Team</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            We're always looking for talented individuals who are passionate about AI, communication, and building great products.
          </p>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            <JobCard title="Senior AI Engineer" location="San Francisco" />
            <JobCard title="Full Stack Developer" location="Remote" />
            <JobCard title="Product Manager" location="New York" />
          </div>
          
          <Button size="lg">View All Positions</Button>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Learn More?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Have questions about our platform or want to discuss potential partnerships? We'd love to hear from you.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={handleContactUs}
            className="text-primary text-base px-8"
          >
            Get in Touch
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

// Team Member Component
interface TeamMemberProps {
  name: string;
  title: string;
  bio: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({ name, title, bio }) => {
  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className="w-24 h-24 rounded-full bg-muted mb-4"></div>
      <h3 className="text-xl font-bold">{name}</h3>
      <p className="text-primary font-medium mb-2">{title}</p>
      <p className="text-muted-foreground">{bio}</p>
    </div>
  );
};

// Job Card Component
interface JobCardProps {
  title: string;
  location: string;
}

const JobCard: React.FC<JobCardProps> = ({ title, location }) => {
  return (
    <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer">
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm">{location}</p>
    </div>
  );
};

export default AboutPage;
