
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLogoProps {
  isScrolled: boolean;
}

export const NavLogo: React.FC<NavLogoProps> = ({ isScrolled }) => {
  return (
    <Link to="/" className="flex items-center">
      <img
        src="/lovable-uploads/56e1912c-6199-4933-a4e9-409fbe7e9311.png"
        alt="RoboQuant Academy"
        className="h-8"
      />
    </Link>
  );
};
