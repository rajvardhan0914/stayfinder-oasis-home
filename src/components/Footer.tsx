import React from "react";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="w-full border-t border-border bg-background py-8 px-2 text-center text-xs sm:text-sm text-muted-foreground mt-0">
    <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-4">
      <div className="flex-1 text-left space-y-2">
        <div className="font-bold text-lg text-foreground">Stayfinder Oasis</div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" /> 123 Main Street, Hyderabad, India
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" /> support@stayfinder.com
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" /> +91-XXXXXXXXXX
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center gap-3">
        <div className="font-semibold mb-1">Useful Links</div>
        <div className="flex flex-col gap-1">
          <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:underline">Terms of Service</Link>
          <a href="#" className="hover:underline">Sitemap</a>
          <Link to="/contact" className="hover:underline">Contact Us</Link>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center md:items-end gap-3">
        <div className="font-semibold mb-1">Follow Us</div>
        <div className="flex gap-3">
          <a href="#" aria-label="Facebook"><Facebook className="h-5 w-5 hover:text-primary" /></a>
          <a href="#" aria-label="Twitter"><Twitter className="h-5 w-5 hover:text-primary" /></a>
          <a href="#" aria-label="Instagram"><Instagram className="h-5 w-5 hover:text-primary" /></a>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Stayfinder Oasis. All rights reserved.</div>
      </div>
    </div>
  </footer>
);

export default Footer; 