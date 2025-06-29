import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Header } from '@/components/Header';

const Contact = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Contact Information</h1>
        <div className="flex flex-col gap-4 items-center text-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>123 Main Street, Hyderabad, India</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <span>support@stayfinder.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <span>+91-XXXXXXXXXX</span>
          </div>
        </div>
        <a
          href="mailto:support@stayfinder.com"
          className="inline-block mt-6 px-6 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold shadow hover:from-teal-600 hover:to-blue-600 transition"
        >
          Email Us
        </a>
      </div>
    </div>
  </div>
);

export default Contact; 