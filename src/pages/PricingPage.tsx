
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate("/chat");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleTalkToSales = () => {
    // In a real application, this would open a contact form or chat with sales
    window.open("mailto:sales@multichat-ai.com", "_blank");
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
              className="font-medium text-primary"
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Flexible Pricing for Every Need
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Choose the right plan for your personal, business, or enterprise needs.
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted} 
            className="text-base px-8"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              plan="Free"
              price="$0"
              description="Perfect for individuals looking to try out Multi-Chat AI"
              features={[
                { name: "AI-Powered Replies", included: true },
                { name: "Multi-Platform Integration", included: false },
                { name: "Unlimited Chat History", included: false },
                { name: "Voice-to-Text", included: false },
                { name: "24/7 Priority Support", included: false },
                { name: "Custom API Access", included: false },
              ]}
              ctaLabel="Get Started"
              ctaAction={handleGetStarted}
            />
            
            <PricingCard
              plan="Pro"
              price="$12.99"
              period="per month"
              description="Great for professionals and small teams"
              features={[
                { name: "AI-Powered Replies", included: true },
                { name: "Multi-Platform Integration", included: true },
                { name: "Unlimited Chat History", included: true },
                { name: "Voice-to-Text", included: true },
                { name: "24/7 Priority Support", included: true },
                { name: "Custom API Access", included: false },
              ]}
              highlighted={true}
              ctaLabel="Upgrade to Pro"
              ctaAction={handleGetStarted}
            />
            
            <PricingCard
              plan="Enterprise"
              price="Custom"
              description="For large organizations with specific requirements"
              features={[
                { name: "AI-Powered Replies", included: true },
                { name: "Multi-Platform Integration", included: true },
                { name: "Unlimited Chat History", included: true },
                { name: "Voice-to-Text", included: true },
                { name: "24/7 Priority Support", included: true },
                { name: "Custom API Access", included: true },
              ]}
              ctaLabel="Talk to Sales"
              ctaAction={handleTalkToSales}
              ctaVariant="outline"
            />
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">
              All Pro and Enterprise plans come with a 30-day money-back guarantee.
              <br />
              For custom enterprise pricing and features, please contact our sales team.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <FaqItem 
              question="Can I change plans at any time?"
              answer="Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes to your subscription will take effect immediately."
            />
            <FaqItem 
              question="Is there a limit to the number of chats in the free plan?"
              answer="The free plan allows up to 10 active chat threads and retains history for up to 7 days. For unlimited chats and history, consider upgrading to our Pro plan."
            />
            <FaqItem 
              question="How does the billing cycle work?"
              answer="All subscriptions are billed monthly or annually, based on your preference. Annual subscriptions come with a 20% discount compared to monthly billing."
            />
            <FaqItem 
              question="Can I get a refund if I'm not satisfied?"
              answer="Yes, we offer a 30-day money-back guarantee for all Pro and Enterprise plans. If you're not satisfied, contact our support team for a full refund."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Choose the plan that works for you and start experiencing the future of chat management.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={handleGetStarted}
              className="text-primary text-base px-8"
            >
              Try for Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleTalkToSales}
              className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10 text-base px-8"
            >
              Contact Sales
            </Button>
          </div>
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

// Pricing Card Component
interface PricingCardProps {
  plan: string;
  price: string;
  period?: string;
  description: string;
  features: { name: string; included: boolean }[];
  highlighted?: boolean;
  ctaLabel: string;
  ctaAction: () => void;
  ctaVariant?: "default" | "outline" | "secondary";
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  plan, 
  price, 
  period, 
  description, 
  features, 
  highlighted = false,
  ctaLabel,
  ctaAction,
  ctaVariant = "default"
}) => {
  return (
    <div className={`rounded-lg border ${highlighted ? 'border-primary shadow-lg' : ''} p-8 flex flex-col`}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold">{plan}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-extrabold">{price}</span>
          {period && <span className="ml-1 text-muted-foreground">{period}</span>}
        </div>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>
      
      <ul className="mt-6 space-y-4 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            {feature.included ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0" />
            )}
            <span className={feature.included ? "" : "text-muted-foreground"}>
              {feature.name}
            </span>
          </li>
        ))}
      </ul>
      
      <div className="mt-8">
        <Button 
          className="w-full" 
          variant={ctaVariant}
          onClick={ctaAction}
        >
          {ctaLabel}
        </Button>
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

export default PricingPage;
