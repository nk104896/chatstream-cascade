
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Zap, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface WelcomeMessageProps {
  onNewChat: () => void;
  platformName?: string;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ 
  onNewChat,
  platformName = "Chat Platform" 
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (isAuthenticated) {
      onNewChat();
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight mb-4">
        Seamless Multi-Chat Experience – Connect, Collaborate, and Communicate
      </h2>
      <p className="text-muted-foreground mb-8">
        Welcome to {platformName}! After logging in, you can instantly access your chats. 
        But there's more—discover the power of multi-chat and how it enhances your productivity 
        and communication.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
        <FeatureCard 
          icon={<MessageSquare className="h-6 w-6" />}
          title="Effortless Switching"
          description="Navigate between multiple conversations without losing track."
        />
        <FeatureCard 
          icon={<Users className="h-6 w-6" />}
          title="Enhanced Collaboration"
          description="Manage personal, team, and business chats in one place."
        />
        <FeatureCard 
          icon={<Zap className="h-6 w-6" />}
          title="Productivity Boost"
          description="Keep all discussions organized for faster decision-making."
        />
        <FeatureCard 
          icon={<ArrowRight className="h-6 w-6" />}
          title="Seamless Integration"
          description="Connect with other tools for a unified workflow."
        />
      </div>

      <div className="space-y-6 w-full max-w-md">
        <h3 className="text-xl font-medium">How It Works</h3>
        <ol className="space-y-4 text-left">
          <li className="flex gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              1
            </div>
            <div className="flex-1">
              <strong>Login & Access Chats</strong> – Your current chat page opens immediately.
            </div>
          </li>
          <li className="flex gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              2
            </div>
            <div className="flex-1">
              <strong>Start New Conversations</strong> – Create new chats for different topics or teams.
            </div>
          </li>
          <li className="flex gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              3
            </div>
            <div className="flex-1">
              <strong>Organize & Manage</strong> – Use filters, labels, and pinned chats for easy navigation.
            </div>
          </li>
          <li className="flex gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              4
            </div>
            <div className="flex-1">
              <strong>Seamless Integration</strong> – Connect with other tools for a unified workflow.
            </div>
          </li>
        </ol>
      </div>

      <Button 
        size="lg" 
        className="mt-8"
        onClick={handleButtonClick}
      >
        {isAuthenticated ? "Start a New Chat" : "Login to Start"}
      </Button>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description
}) => {
  return (
    <div className="flex flex-col items-center md:items-start p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="mb-3 rounded-full bg-primary/10 p-2 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default WelcomeMessage;
