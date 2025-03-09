
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface NavigationButtonProps {
  label?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  icon?: React.ReactNode;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  label,
  size = "default",
  variant = "default",
  className,
  icon,
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
      {label || (isAuthenticated ? "Go to Chat" : "Login / Sign Up")}
      {icon}
    </Button>
  );
};

export default NavigationButton;
