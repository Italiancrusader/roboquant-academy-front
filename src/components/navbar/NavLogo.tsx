
import React from "react";
import { Link } from "react-router-dom";

interface NavLogoProps {
  isScrolled: boolean;
}

export const NavLogo: React.FC<NavLogoProps> = ({ isScrolled }) => {
  return (
    <Link to="/" className="flex items-center">
      <img
        src="/lovable-uploads/1db84306-2667-4e34-b98f-aefc881b060d.png"
        alt="RoboQuant Academy"
        className="h-8 md:h-10"
      />
    </Link>
  );
};
