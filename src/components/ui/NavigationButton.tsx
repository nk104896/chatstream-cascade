
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface NavigationButtonProps {
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  size = "default",
  variant = "default",
  className,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleClick = () => {
    if (isAuthenticated) {
      navigate("/chat");
    } else {
      navigate("/login");
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleClick}
      className={className}
    >
      {isAuthenticated ? "Go to Chat" : "Login / Sign Up"}
    </Button>
  );
};

export default NavigationButton;
