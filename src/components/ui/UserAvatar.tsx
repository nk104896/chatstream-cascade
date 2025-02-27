
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";

interface UserAvatarProps {
  user: User | null;
  size?: "sm" | "md" | "lg";
  fallback?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = "md",
  fallback
}) => {
  // Define sizes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  const getFallbackText = () => {
    if (fallback) return fallback;
    if (!user?.name) return "?";
    
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  };

  return (
    <Avatar className={`${sizeClasses[size]} border border-border shadow-subtle`}>
      {user?.avatar && (
        <AvatarImage
          src={user.avatar}
          alt={user.name || "User avatar"}
          className="object-cover"
        />
      )}
      <AvatarFallback 
        className="bg-muted text-muted-foreground font-medium"
      >
        {getFallbackText()}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
